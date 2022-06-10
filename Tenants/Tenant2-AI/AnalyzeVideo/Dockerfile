FROM python:3
ADD requirements.txt /requirements.txt
RUN apt update && apt install ffmpeg libsm6 libxext6  -y
RUN pip3 install -r /requirements.txt
COPY . .
CMD [ "python", "analyze.py" ]
