import dotenv from "dotenv";
dotenv.config();
import { ApifyClient } from "apify-client";

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

export const fetchInternships = async (req, res) => {
  try {
    const {
      job_category = "Software Development",
      location = "Delhi",
      work_from_home = false,
      stipend = "₹5000"
    } = req.body || req.query;

    const input = {
      max_results: 12,
      job_category,
      location,
      work_from_home: work_from_home === 'true' || work_from_home === true,
      stipend
    };

    // Run the scraper
    const run = await client
      .actor("salman_bareesh/internshala-scrapper")
      .call(input);

    // Fetch items from the dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    res.json({ count: items.length, internships: items });
  } catch (error) {
    console.error("❌ Error running scraper:", error.message);
    res.status(500).json({ error: error.message });
  }
}; 