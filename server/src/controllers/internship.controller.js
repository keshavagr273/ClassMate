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

    console.log("🚀 Starting internship scraping with input:", input);

    // Set timeout for the entire operation (2 minutes)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 2 minutes')), 120000);
    });

    // Run the scraper with timeout
    const scrapingPromise = client
      .actor("salman_bareesh/internshala-scrapper")
      .call(input);

    const run = await Promise.race([scrapingPromise, timeoutPromise]);
    console.log("✅ Scraping completed, fetching results...");

    // Fetch items from the dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`📊 Found ${items.length} internships`);

    res.json({ 
      count: items.length, 
      internships: items,
      message: "Internships fetched successfully"
    });
  } catch (error) {
    console.error("❌ Error running scraper:", error.message);
    
    // Provide more specific error messages
    let errorMessage = "Failed to fetch internships";
    if (error.message.includes('timeout')) {
      errorMessage = "Request timed out. The scraping process is taking longer than expected.";
    } else if (error.message.includes('APIFY_TOKEN')) {
      errorMessage = "API configuration error. Please contact support.";
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
}; 