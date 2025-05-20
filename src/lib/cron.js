import { CronJob } from "cron";
import "dotenv/config";
import https from "https";
// import http from "http";

const job = new CronJob("*/14 * * * *", function () {
  const url = process.env.API_URL;

  if (!url) {
    console.error("API_URL is not defined in environment variables");
    return;
  }

  console.log("Sending GET request to:", url);

  https
    .get(url, (res) => {
      if (res.statusCode === 200) {
        console.log("GET request sent successfully");
      } else {
        console.log(`GET request failed with status: ${res.statusCode}`);
      }

      // Optional: consume response data to free up memory
      // res.resume();
    })
    .on("error", (e) => {
      console.error("Error while sending GET request:", e);
    });
});

// job.start(); // Start the cron job

export default job;
