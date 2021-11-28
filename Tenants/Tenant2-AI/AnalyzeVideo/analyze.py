import cv2
from paho.mqtt import client as mqtt_client
import config
import time

HOGCV = cv2.HOGDescriptor()
HOGCV.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())




def analyze_video(frame):
    bounding_box_cordinates, weights =  HOGCV.detectMultiScale(frame, winStride = (4, 4), padding = (8, 8), scale = 1.03)
    
    people_count = 0
    for x,y,w,h in bounding_box_cordinates:
        # cv2.rectangle(frame, (x,y), (x+w,y+h), (0,255,0), 2)
        # cv2.putText(frame, f'person {people_count}', (x,y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,255), 1)
        people_count += 1
    
    # cv2.putText(frame, 'Status : Detecting ', (40,40), cv2.FONT_HERSHEY_DUPLEX, 0.8, (255,0,0), 2)
    # cv2.putText(frame, f'Total Persons : {people_count}', (40,70), cv2.FONT_HERSHEY_DUPLEX, 0.8, (255,0,0), 2)

    return frame,people_count

def publish_people_count(people_count):
    try:
        print(people_count)
        topic='/smartcity/camera/people_count/usa/ohio/store_x/city_ai'
        msg=people_count        
        result = config.mqtt_client.publish(topic, msg)
    except Exception as e:
        print(e)
        pass


def connect_mqtt():
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print("Failed to connect, return code %d\n", rc)

    try:
        print("Connecting")
        client = mqtt_client.Client(client_id="123456")
        client.username_pw_set("tenant-2", "123456")
        client.on_connect = on_connect
        client.connect("192.168.99.104", 1883)
        config.mqtt_client = client
    except Exception as e:
        # print(e)
        pass


connect_mqtt()

while True:
    time.sleep(1)
    try:
        video = cv2.VideoCapture('rtmp://192.168.99.104/live/smartcity.camera.stream.usa.ohio.store_x.city_surveillance?username=tenant-2&password=123456')
        count = 0
        while video.isOpened():
            count = count +1
            check, frame =  video.read()

            

            # //Skip Frame 
            if count%30>0:
                continue

            try:

                frame,people_count = analyze_video(frame=frame)           
                publish_people_count(people_count=people_count)
            except:
                pass

    except Exception as e:
        print(e)
