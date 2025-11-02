# Instagram Explore Comment Liker - Test Instructions

## ✅ Implementation Complete!

The test script is ready following Viktor's exact requirements from the Oct 31 meeting.

## 📋 What the Test Does

1. ✅ Launches GoLogin profile (uses `ig_monu_sumtan` - first profile)
2. ✅ Navigates to instagram.com/explore
3. ✅ Finds posts in explore feed
4. ✅ Picks random post
5. ✅ **Checks database** - skips if already processed (prevents unliking)
6. ✅ Opens the post
7. ✅ Finds **FIRST 3 COMMENTS** visible (Viktor: "just focus on the first three")
8. ✅ For each comment:
   - Checks if already liked (skips if "Unlike" button)
   - Extracts comment author, text, likes count
   - Clicks **COMMENT like button** (NOT post like button)
   - Random delay 3-7 seconds between likes
9. ✅ Saves post URL to database
10. ✅ Logs everything (JSON + text files)
11. ✅ Keeps browser open for manual verification

## 🚀 How to Run

### Prerequisites:
- GoLogin app must be running
- Instagram accounts logged in (already done: 5 profiles verified)
- Database initialized (already done: `ig_engagement.db`)

### Run the test:

```bash
cd services/ig-engagement-service
python test_explore_liker.py
```

### What to expect:

```
================================================================================
Instagram Explore Comment Liker - TEST MODE
================================================================================

[STEP 1] Selecting GoLogin profile...
Selected profile: ig_monu_sumtan
Profile ID: 6907382efcd9c527b57660d0

[STEP 2] Launching GoLogin profile...
GoLogin started: 127.0.0.1:xxxxx

[STEP 3] Connecting Selenium...
Selenium connected

[STEP 4] Verifying Instagram login...
Instagram login verified ✓

[STEP 5] Navigating to /explore...
Loaded /explore page

[STEP 6] Processing one random post...
Found 18 posts in explore feed
Processing post: https://instagram.com/p/ABC123xyz
Post by: @someuser
Found 24 comments, will like 3
  ✓ Liked comment 1/3 by @user1: "Amazing post!" (42 likes)
  ✓ Liked comment 2/3 by @user2: "So cool!" (18 likes)
  ✓ Liked comment 3/3 by @user3: "Love it" (7 likes)

Successfully liked 3 comments

[STEP 7] Saving logs...
JSON log saved: logs/explore_ig_monu_sumtan_20251102_133045.json
Text log saved: logs/explore_ig_monu_sumtan_20251102_133045.txt

================================================================================
TEST COMPLETE!
================================================================================

Please manually verify:
1. Check log files in: services/ig-engagement-service/logs
2. Open post URLs from logs
3. Find comments by author names
4. Confirm your likes appear

Browser will stay open. Press Enter to close...
```

## 🔍 Manual Verification (CRITICAL!)

Viktor emphasized: **"you have to manually verify the script's success"**

### Steps to verify:

1. **Read the log files** in `services/ig-engagement-service/logs/`
   - Open the `.txt` file (human-readable)
   - Note the post URL
   - Note the 3 comment authors

2. **Open Instagram** (in the same GoLogin profile or any browser)
   - Navigate to the post URL from logs
   - Scroll to comments
   - Find the 3 users who commented (from logs)
   - **Confirm their comments show your like** (heart filled in)

3. **Verify in database:**
   ```bash
   sqlite3 ig_engagement.db
   SELECT * FROM processed_posts ORDER BY processed_at DESC LIMIT 1;
   ```

## 📊 Log Files

After running, you'll find 2 log files in `logs/`:

### JSON Log (`explore_{profile}_{timestamp}.json`)
```json
{
  "session_id": "uuid-123",
  "profile_name": "ig_monu_sumtan",
  "started_at": "2025-11-02T13:00:00",
  "posts": [
    {
      "url": "https://instagram.com/p/ABC123",
      "author": "someuser",
      "opened_at": "2025-11-02T13:01:00",
      "comments": [
        {
          "author": "user1",
          "text": "Amazing post!",
          "likes_before": 42,
          "clicked": true,
          "timestamp": "2025-11-02T13:01:15",
          "index": 1
        }
      ]
    }
  ]
}
```

### Text Log (`explore_{profile}_{timestamp}.txt`)
```
================================================================================
Instagram Explore Test Session
================================================================================

Profile: ig_monu_sumtan
Started: 2025-11-02T13:00:00
Ended: 2025-11-02T13:02:30

Post: https://instagram.com/p/ABC123
Author: @someuser
Opened: 2025-11-02T13:01:00
Comments: 3

  ✓ Comment by @user1
     Text: "Amazing post!"
     Likes before: 42
     Clicked: true

  ✓ Comment by @user2
     Text: "So cool!"
     Likes before: 18
     Clicked: true

  ✓ Comment by @user3
     Text: "Love it"
     Likes before: 7
     Clicked: true
```

## 🐛 If Issues Occur

### Issue: "Not logged into Instagram"
**Fix:** 
- Open GoLogin profile manually
- Log into Instagram
- Close profile
- Run test again

### Issue: "No posts found in explore feed"
**Fix:**
- Check selector in console: `document.querySelectorAll("article a[href*='/p/']")`
- Instagram may have changed HTML structure
- Update selectors in test script

### Issue: "No comment like buttons found"
**Fix:**
- Open Instagram manually
- Navigate to a post
- Open browser DevTools
- Check comment structure
- Update XPath in `find_comment_like_buttons()` method

### Issue: Browser closes immediately
**Fix:**
- Check logs for errors
- Ensure GoLogin app is running
- Verify profile name exists

## ✅ Success Criteria

Before moving to Phase 2 (integration):

- ✅ Script runs without crashes
- ✅ Browser opens to /explore
- ✅ Posts are found and opened
- ✅ Comment like buttons are clicked
- ✅ **Manual Instagram check confirms likes appear** ← MOST IMPORTANT
- ✅ Database shows processed post
- ✅ Log files are generated with all details
- ✅ Already-liked detection works
- ✅ Random delays feel natural

## 📝 Next Steps

Once test works perfectly:

1. **Run test 3-5 times** to verify consistency
2. **Test with different profiles** (change line in `select_profile()`)
3. **Verify database tracking** prevents re-processing
4. **Share logs with Viktor** for review
5. **Integrate into main `automation_worker.py`**

## 🎯 Key Requirements Met

✅ Like COMMENTS only (not posts)  
✅ Like FIRST 3 comments visible  
✅ Check database before processing  
✅ Detailed logging for manual verification  
✅ Random delays (3-7 seconds)  
✅ Browser stays open for inspection  

## 📞 Questions?

If you encounter issues or need clarification, check:
- Meeting transcript: `meeting/transcript.txt` (lines 74-155)
- Meeting summary: `meeting/Oct 31, 2025.txt`
- Implementation summary: `IMPLEMENTATION_SUMMARY.md`

