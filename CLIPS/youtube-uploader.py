import json 
import os
import re
import datetime
from Google import Create_Service
from googleapiclient.http import MediaFileUpload

CLIENT_SECRET_FILE = 'client_secret.json'
API_NAME = 'youtube'
API_VERSION = 'v3'
SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

service = Create_Service(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)

# upload_date_time = datetime.datetime(2021, 1, 3, 12, 30, 0).isoformat() + '.000Z'


# ######## GET CLIP DATA ########

# Get current directory path
mypath = os.path.dirname(os.path.realpath(__file__))

# Get files in this directory path
files = os.listdir(mypath)

# Get the video file
for f in files:
  if ".mp4" in f:
    video = f

# Opening JSON file 
f = open("../Data/ClipData.json")
data = json.load(f) 

clipViews = str(data["views"])
clipTitle = data["title"]
channelName = data["name"]

# Closing JSON file 
f.close()

request_body = {
    'snippet': {
        'categoryId': 24,
        'title': clipTitle,
        'description': clipTitle + "\nCredits: https://www.twitch.tv/" + channelName + "\n\nMy Twitter: https://twitter.com/Clipperinoo\n\nIf you're in this clip and want it removed you can DM me on Twitter :)",
        'tags': [clipTitle, channelName, 'Twitch Clips', 'Most Viewed', "Twitch Fails", "Top", "Best", "Of The Day"]
    },
    'status': {
        'privacyStatus': 'private',
        # 'publishAt': upload_date_time,
        'selfDeclaredMadeForKids': False, 
    },
    'notifySubscribers': False
}

# Upload Video
mediaFile = MediaFileUpload(video)

response_upload = service.videos().insert(
    part='snippet,status',
    body=request_body,
    media_body=mediaFile
).execute()


# service.thumbnails().set(
#     videoId=response_upload.get('id'),
#     media_body=MediaFileUpload('thumbnail.jpg')
# ).execute()