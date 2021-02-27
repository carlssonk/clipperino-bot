# clipperino-bot

Clipperino-Bot automatically fetches the most popular clips from twitch every 4 hours & uploads them to youtube.

## How to use
1. Download this repo.
2. Create an application on https://dev.twitch.tv/console to get your client id and client secret
3. In **start.js**, replace


    const clientId = "your_client_id_here <--- with your id
  
  
    const clientSecret = "your_client_secret_here" <--- with your secret


4. run **start.js**

OPTIONAL:

5. To change when you want the bot to fetch and upload the clips to youtube, you can set your own schedule in **start.js**


    ([schedule_times](https://i.ibb.co/BTQJWVc/shcedule-Job.jpg))
6. You can also change Title name, tags, description etc. when uploading to Youtube in **youtube-uploader.py**.


    ([video_body](https://i.ibb.co/wcH3NgP/youtube-uploader-body.jpg))
