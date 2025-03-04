import re
from flask import Flask, render_template, jsonify, request
import pymysql
from pymysql.cursors import DictCursor
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow import keras
from keras.models import Sequential
from keras.layers import Dense, LSTM
from datetime import datetime,timedelta
import json
from apscheduler.schedulers.background import BackgroundScheduler
import traceback
from pytz import timezone

app = Flask(__name__)

# ------------------------------------------------------------------
# Database 연결 및 쿼리 실행 함수
# ------------------------------------------------------------------
def get_db_connection():
    try:
        return pymysql.connect(
            host="localhost",
            user="root",
            password="1234",
            database="crimeTP",
            cursorclass=DictCursor  # DictCursor 사용
        )
    except pymysql.Error as e:
        print(f"Database connection failed: {e}")
        raise
# ------------------------------------------------------------------
# 공통: 데이터베이스 쿼리 실행 함수
# ------------------------------------------------------------------
def execute_query(query, params=None, fetch=True):
    db = get_db_connection()
    try:
        with db.cursor() as cursor:
            cursor.execute(query, params or ())
            if fetch: # select와 같은 조회 쿼리 (True일 경우)
                return cursor.fetchall()
            db.commit() # 데이터베이스에서 변경 작업 (insert, update, delete) 확정, 데이터베이스에 영구적으로 반영.
                        # 트랜잭션 시작 -> sql 실행 (i, u, d) -> 확정 
    finally:
        db.close()
# ------------------------------------------------------------------
# 엑셀 파일 읽기 (보도 뉴스 데이터) 및 데이터 전처리
# ------------------------------------------------------------------
file_name = 'C:/Users/GR/범죄 보도 뉴스 (2023).xlsx'
df = pd.read_excel(file_name)
df["일자"] = pd.to_datetime(df["일자"])
df = df.sort_values(by="일자", ascending=False)

# ------------------------------------------------------------------
# 메인 페이지: 메인 지역 리스트 및 보도 뉴스 데이터 전달
# ------------------------------------------------------------------
@app.route('/graphes')
def get_regions_api():
    query = "SELECT DISTINCT main_region FROM regions"
    regions = execute_query(query)
    region_list = [region['main_region'] for region in regions]
    return jsonify(region_list)

@app.route('/graphes/news')
def get_news_api():
    top_5_data = df[['제목', '일자', '언론사']].head(5)
    html_table = top_5_data.to_html(classes='table table-striped', index=False, border=0)
    initial_articles = top_5_data.to_dict(orient='records')
    default_date = '2023-10-14'
    return jsonify({
        "default_date": default_date,
        "html_table": html_table,
        "initial_articles": initial_articles
    })
# ------------------------------------------------------------------
# 보도 뉴스 데이터를 날짜별 반환 (AJAX 요청 등)
# ------------------------------------------------------------------    
@app.route('/articles/<date>', methods=['GET'])
def get_articles(date):
    try: 
        selected_date = pd.to_datetime(date)
        filtered_data = df[df["일자"].dt.strftime('%Y-%m-%d') == date]

        if filtered_data.empty:
            return jsonify([])
        
        result = filtered_data[['제목', '일자', '언론사','본문']].head(5).to_dict(orient='records')
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
  
    
   
# ------------------------------------------------------------------
# 특정 메인 지역의 세부 지역 리스트 반환
# ------------------------------------------------------------------
@app.route('/subregions/<main_region>')
def get_subregions(main_region):
    query = """
        SELECT distinct sub_region FROM regions
        WHERE main_region = %s
        """
    subregions = execute_query(query, (main_region,))
    return jsonify([sub['sub_region'] for sub in subregions]) 
    
# ------------------------------------------------------------------
# 특정 세부 지역의 상위 5개 범죄 데이터를 반환
# ------------------------------------------------------------------
@app.route('/plot/<main_region>/<sub_region>')
def get_crime_data(main_region, sub_region):
    query = """
        SELECT c.crime_name, SUM(co.occurences) AS total_occurences
        FROM crime_occurences co
        JOIN regions r ON co.region_id = r.id
        JOIN crimes c ON co.crime_id = c.id
        WHERE r.main_region = %s AND r.sub_region = %s
        GROUP BY c.crime_name
        ORDER BY total_occurences DESC
        LIMIT 5
        """
    crime_data = execute_query(query, (main_region, sub_region))
    labels = [entry['crime_name'] for entry in crime_data]
    data = [entry['total_occurences'] for entry in crime_data]
    return jsonify({"labels": labels, "data": data})

# ------------------------------------------------------------------
# [시간대별 범죄 예측] LSTM 모델 학습 및 예측 함수 (시간대 예측)
# ------------------------------------------------------------------
def train_lstm_model2():

    #데이터베이스에서 데이터 가져오기
    db = get_db_connection()
    cursor=db.cursor()

    query = """
    SELECT Year, CrimeType, TimeRange, Count 
        FROM CrimeStats 
        WHERE CrimeType IN ('살인기수', '살인미수등', '강도', '강간', '유사강간', '강제추행', 
                            '기타강간', '방화', '상해', '폭행', '체포 감금', '협박', 
                            '약취 유인', '폭력행위등', '공갈', '손괴', '사기');
        """
    cursor.execute(query)
    results = cursor.fetchall()

    columns = ['Year', 'CrimeType', 'TimeRange', 'Count']
    data = pd.DataFrame(results, columns=columns)

    #데이터 전처리
    data['TimeRange'] = data['TimeRange'].str.extract(r'(\d+):')[0].astype(int)
    data_pivot = data.pivot_table(index=['Year','CrimeType'],columns=['TimeRange'],values='Count',fill_value=0)
    train=data_pivot[data_pivot.index.get_level_values(0)<2020]
    crime_types = train.index.get_level_values(1).unique()

    #스케일링 및 LSTM 학습
    scaler = MinMaxScaler()
    results = {}
    for crime_type in crime_types:
        crime_data = train.xs(crime_type, level='CrimeType')
        train_scaled = scaler.fit_transform(crime_data)

        #시계열 데이터 형식 변환
        X_train, y_train = [],[]
        for i in range (1, len(train_scaled)):
            X_train.append(train_scaled[i-1])
            y_train.append(train_scaled[i])

        X_train, y_train = np.array(X_train), np.array(y_train)

        model = Sequential([
            LSTM(50, activation='relu', input_shape=(X_train.shape[1],1)),
            Dense(X_train.shape[1])
        ])
        model.compile(optimizer='adam', loss='mse')
        model.fit(X_train, y_train, epochs=50, batch_size=16, verbose=0)

        X_test = np.expand_dims(train_scaled[-1], axis=0)
        predicted_scaled = model.predict(X_test)
        predicted = scaler.inverse_transform(predicted_scaled)

        results[crime_type] = predicted.flatten()
        print("LSTM predictions (time):", results)

    cursor.close()
    db.close()

    return results
    


# ------------------------------------------------------------------
# MySQL에 예측값을 업데이트하는 함수 (시간대 예측)
# ------------------------------------------------------------------
def update_predictions_in_mysql2():
    print("예측값(시간) 업데이트 시작")
    try:
    #마지막 업데이트 시간을 MySQL에서 가져옴
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM time_status")
        result = cursor.fetchone()
        if result['count'] == 0:
            cursor.execute("insert into time_status(id, last_update_time2) values (1, null)")
            db.commit()
            print("Initizlized system_status table")
            last_update_time2 = None
        else:
            #마지막 업데이트 시간 확인
            cursor.execute("select last_update_time2 from time_status where id=1")
            last_update_time2_result = cursor.fetchone()
            if last_update_time2_result and last_update_time2_result['last_update_time2']:
                last_update_time2 = datetime.strptime(str(last_update_time2_result['last_update_time2']),"%Y-%m-%d %H:%M:%S")
            else:
                last_update_time2 = None
        now = datetime.now()

        #마지막 업데이트 시간이 없거나 하루 이상 경과한 경우 LSTM 학습 수행
        if last_update_time2 is None or (now - last_update_time2) > timedelta(hours=3):
            print("새로운 LSTM 학습 시작")
            lstm_predictions2 = train_lstm_model2()

            #MySQL에 예측값 저장
            for crime, prediction in lstm_predictions2.items():
                cursor.execute("""
                    insert into crime_predictions_time (crime_type2, prediction2, prediction_date2)
                            values (%s, %s, %s)
                            """,(crime, json.dumps(prediction.tolist()), now))
                
            db.commit()
            print("예측값(시간)이 SQL에 저장되었습니다")

            #마지막 업데이트 시간 갱신
            cursor.execute("update time_status set last_update_time2 = %s where id=1", (now,))
            db.commit()
        else:
            print("예측값(시간)은 최신 상태입니다. MySQL에서 값을 불러옵니다")
    except Exception as e:
        
        print(f"스케줄러 실행 {datetime.now()}")
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

#스케줄러 설정: 매일 3시간마다 업데이트
scheduler = BackgroundScheduler(daemon=True, timezone = 'Asia/Seoul')
scheduler.add_job(update_predictions_in_mysql2, 'cron', hour='0,3,6,9,12,15,18,21',  minute = 0)
scheduler.start()
print(f"Scheduler started successfully at {datetime.now()}")


# 현재 시간대 TOP 3 범죄 데이터 반환
@app.route('/graphes/current_time_top3/<int:time_range_index>', methods=['GET'])
def current_time_top3(time_range_index):
    try:
        #MySQL에서 예측값 가져오기
        db=get_db_connection()
        cursor=db.cursor()

        cursor.execute("""
            select last_update_time2 from time_status
            order by last_update_time2 desc
            limit 1
            """)
        result = cursor.fetchone()

        #last_update_time이 None인 경우
        if not result or 'last_update_time2' not in result:
            print("No last_update_time2 found")
            return jsonify({"labels":[], "data":[]})
        
        last_update_time2 = result['last_update_time2']

        cursor.execute("""
            SELECT crime_type2, prediction2
            FROM crime_predictions_time
            WHERE DATE(prediction_date2) = DATE(%s)
        """, (last_update_time2,))

        predictions2 = cursor.fetchall()

        if not predictions2:
            print("No predictions found for today")
            return jsonify({"labels":[], "data":[]})
        
        predicted_current_day = {}
        for row in predictions2:
            try:
                prediction_date2 = json.loads(row['prediction2'])
                predicted_current_day[row['crime_type2']] = prediction_date2[time_range_index]
            except (json.JSONDecodeError, IndexError) as e:
                print(f"Error processing prediction for {row['crime_type2']}: {e}")
                continue

        top_3_crimes = sorted(predicted_current_day.items(), key=lambda x: x[1], reverse=True)[:3]

        labels = [crime for crime, count in top_3_crimes]
        data = [float(count) for crime, count in top_3_crimes]

        return jsonify({"labels": labels, "data": data})
    
    except Exception as e:
        print(f"Error in current_time_top3: {e}")
        traceback.print_exc()
        return jsonify({"labels": [], "data": [], "error": str(e)})
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
        
# ------------------------------------------------------------------
# [요일별 범죄 예측] LSTM 모델 학습 및 예측 함수 (요일 예측)
# ------------------------------------------------------------------
def train_lstm_model():
    # 데이터베이스에서 데이터 가져오기
    
    
    db = get_db_connection()
    cursor = db.cursor()
    
    query = """
    SELECT Year, CrimeType, Days, Count 
    FROM CrimeDays 
    WHERE CrimeType IN ('살인기수', '살인미수등', '강도', '강간', '유사강간', '강제추행', 
                        '기타강간', '방화', '상해', '폭행', '체포 감금', '협박', 
                        '약취 유인', '폭력행위등', '공갈', '손괴', '사기');
    """
    cursor.execute(query)
    results = cursor.fetchall()
    
    columns = ['Year', 'CrimeType', 'Days', 'Count']
    data = pd.DataFrame(results, columns=columns)

    # 데이터 전처리 (요일을 숫자로 매핑)
    day_mapping = {'월': 0, '화': 1, '수': 2, '목': 3, '금': 4, '토': 5, '일': 6}
    data['Days'] = data['Days'].map(day_mapping)
    
    # 피벗 테이블로 데이터 변환
    data_pivot = data.pivot_table(index=['Year', 'CrimeType'], columns=['Days'], values='Count', fill_value=0)
    
    # 학습 데이터 준비
    train = data_pivot[data_pivot.index.get_level_values(0) < 2020]
    crime_types = train.index.get_level_values(1).unique()
    scaler = MinMaxScaler()
    results = {}

    for crime_type in crime_types:
        crime_data = train.xs(crime_type, level='CrimeType')
        train_scaled = scaler.fit_transform(crime_data)
        
        X_train, y_train = [], []
        for i in range(1, len(train_scaled)):
            X_train.append(train_scaled[i - 1])
            y_train.append(train_scaled[i])
        
        X_train, y_train = np.array(X_train), np.array(y_train)
        
        model = Sequential([
            LSTM(50, activation='relu', input_shape=(X_train.shape[1], 1)),
            Dense(X_train.shape[1])
        ])
        model.compile(optimizer='adam', loss='mse')
        model.fit(X_train, y_train, epochs=50, batch_size=16, verbose=0)
        
        X_test = np.expand_dims(train_scaled[-1], axis=0)
        predicted_scaled = model.predict(X_test)
        predicted = scaler.inverse_transform(predicted_scaled)
        
        results[crime_type] = predicted.flatten()
    
    cursor.close()
    db.close()
   

    return results

# ------------------------------------------------------------------
# MySQL에 예측값을 업데이트하는 함수 (요일 예측)
# ------------------------------------------------------------------
def update_predictions_in_mysql():

    print(f"예측값 업데이트 시작: {datetime.now()}")

    try: 
    # 마지막 업데이트 시간을 MySQL에서 가져옴
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM system_status")
        result = cursor.fetchone()
        if result['count'] == 0:
            cursor.execute("INSERT INTO system_status (id, last_update_time) VALUES (1, NULL)")
            db.commit()
            print("Initialized system_status table")
            last_update_time = None
        else:
            # 마지막 업데이트 시간 확인
            cursor.execute("SELECT last_update_time FROM system_status WHERE id = 1")
            last_update_time_result = cursor.fetchone()
            if last_update_time_result and last_update_time_result['last_update_time']:
                last_update_time = datetime.strptime(str(last_update_time_result['last_update_time']), "%Y-%m-%d %H:%M:%S")
            else:
                last_update_time = None

        now = datetime.now(timezone('Asia/Seoul'))
       
        
    # 마지막 업데이트 시간이 없거나 하루 이상 경과한 경우 LSTM 학습 수행
        if last_update_time is None or (now - last_update_time) > timedelta(days=1):
            print("새로운 LSTM 학습 시작")
            lstm_predictions = train_lstm_model()  # LSTM 모델 학습 및 예측값 가져오기

            # MySQL에 예측값 저장
            for crime, prediction in lstm_predictions.items():
                cursor.execute(""" 
                    INSERT INTO crime_predictions_days (crime_type, prediction, prediction_date) 
                    VALUES (%s, %s, %s)
                """, (crime, json.dumps(prediction.tolist()), now))  # prediction을 list로 변환

            db.commit()
            print("예측값이 MySQL에 저장되었습니다")

            # 마지막 업데이트 시간 갱신
            cursor.execute("UPDATE system_status SET last_update_time = %s WHERE id = 1", (now,))
            db.commit()
        else:
            print("예측값은 최신 상태입니다. MySQL에서 값을 불러옵니다")

        

    except Exception as e:
        print(f"Error in update_predictions_in_mysql: {e}")
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

# 스케줄러 설정: 매일 자정에 예측값 업데이트
scheduler = BackgroundScheduler(daemon=True, timezone = 'Asia/Seoul')
scheduler.add_job(update_predictions_in_mysql, 'cron', hour=0, minute=0)
scheduler.start()

# ------------------------------------------------------------------
# 요일별 범죄 예측 결과 반환
# ------------------------------------------------------------------
@app.route('/graphes/day_of_week_crime', methods=['GET'])
def day_of_week_crime():
    try:
        # MySQL에서 예측값 가져오기
        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute("""
        SELECT last_update_time FROM system_status
        ORDER BY last_update_time DESC
        LIMIT 1
        """)
        last_update_time = cursor.fetchone()

        # last_update_time이 None인 경우 처리
        if not last_update_time:
            print("No last_update_time found")
            return jsonify({"labels": [], "data": []})
        
        # last_update_time이 dict인 경우 'last_update_time' 키로 값 추출
        if isinstance(last_update_time, dict):
            last_update_time = last_update_time['last_update_time']
            print(f"Fetched last_update_time: {last_update_time}")  
        else:
            print(f"last_update_time is not a dictionary: {last_update_time}")
            return jsonify({"labels": [], "data": []})

        # last_update_time이 datetime 객체인지 확인
        if isinstance(last_update_time, datetime):  

            print(f"Fetching predictions for date: {last_update_time}")
        else:
            print(f"last_update_time is not a valid datetime: {last_update_time}")
            return jsonify({"labels": [], "data": []})

        cursor.execute("""
            SELECT crime_type, prediction 
            FROM crime_predictions_days
            WHERE DATE(prediction_date) = (SELECT DATE(last_update_time) 
                                            FROM system_status 
                                            ORDER BY last_update_time DESC LIMIT 1);
        """)
        predictions = cursor.fetchall()
        print("Found predictions:", predictions)

        # 예측값 없으면 빈 결과 반환
        if not predictions:
            print("No predictions found for today")
            return jsonify({"labels": [], "data": []})

        # 예측값에서 오늘의 범죄 데이터 추출
        current_day_index = last_update_time.weekday()
        predicted_current_day = {}
        
        for row in predictions:
            try:
                prediction_date = json.loads(row['prediction'])
                predicted_current_day[row['crime_type']] = prediction_date[current_day_index]
            except (json.JSONDecodeError, IndexError) as e:
                print(f"Error processing prediction for {row['crime_type']}: {e}")
                continue

        top_3_crimes = sorted(predicted_current_day.items(), key=lambda x: x[1], reverse=True)[:3]
        print("Top 3 crimes:", top_3_crimes)
        
        labels = [crime for crime, count in top_3_crimes]
        data = [float(count) for crime, count in top_3_crimes]
        print(f"Labels: {labels}, Data: {data}")
        return jsonify({"labels": labels, "data": data})
       

    except Exception as e:
        print(f"Error in day_of_week_crime: {e}")
        traceback.print_exc()  # 스택 트레이스 출력
        return jsonify({"labels": [], "data": [], "error": str(e)})
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
# ------------------------------------------------------------------
# 데이터베이스 테이블 초기화 함수
# ------------------------------------------------------------------
def init_database():
    db = get_db_connection()
    cursor = db.cursor()
    
    # Create system_status table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_status (
        id INT PRIMARY KEY,
        last_update_time DATETIME
    )
    """)
    
    # Create crime_predictions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS crime_predictions_days (
        id INT AUTO_INCREMENT PRIMARY KEY,
        crime_type VARCHAR(255),
        prediction json,
        prediction_date datetime,
        system_status_id int,
        foreign key (system_status_id) references system_status(id)
        on delete cascade
        on update cascade
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS time_status (
        id INT PRIMARY KEY,
        last_update_time2 DATETIME
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS crime_predictions_time (
        id INT AUTO_INCREMENT PRIMARY KEY,
        crime_type2 VARCHAR(255),
        prediction2 JSON,
        prediction_date2 DATETIME
    )
    """)
    
    db.commit()
    cursor.close()
    db.close()


# ------------------------------------------------------------------
# 메인 실행부
# ------------------------------------------------------------------    
if __name__ == '__main__':
    init_database()  # Initialize database tables
    update_predictions_in_mysql()  # Initial prediction update
    update_predictions_in_mysql2()
    app.run(debug=True)