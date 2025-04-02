# CleanNamer
Dirty movie names from, uh, disreputable sources. Name them how Jellyfin expects, based on a call to openAI

## April 1st.

You can call ts-node scripts/askGpt.ts
* It scans /home/jason-horsley/DownloadsToSort/* for the next folder
* It asks GPT "hey this folder... What's the `Movie (year)/Movie.ext` supposed to be?
* It passes it to utils/moveFile.ts

:)

## Next up

* What if the download is JUST a file?

/home/jason-horsley/DownloadsToSort/
├── Coraline.2009.1440p.HDR.AV1.OPUS.SouAV1R.mkv
├── Drive (2011) ITA ENG Ac3 5.1 sub Ita BDRip 1080p H264 [ArMor].mkv
├── Logan.lucky.2017_HDRip_[scarabey.org].avi
├── My Dinner with Andre (1981) 720p.10bit.BluRay.x265-budgetbits.mkv
├── Swiss.Army.Man.2016.1080p.BluRay.6CH.ShAaNiG.mkv

* What if the download already exists in the dest?

* What if the folder is empty? (Don't hit GPT)

* What if it can't do it? (Add a _skip.txt to the folder? Mark a skippedList.txt in the head?)

* What if it's a show?

* Set on a nightly cron (Do at least 10, or until the folder is empty, or until you've skipped everything)