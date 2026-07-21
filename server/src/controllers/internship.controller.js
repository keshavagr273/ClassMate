import dotenv from "dotenv";
dotenv.config();

// Replace Apify with Jooble API
export const fetchInternships = async (req, res) => {
  try {
    const {
      job_category = "Software Development",
      location = "",
      work_from_home = false,
      stipend = "",
      radius = ""
    } = req.body || req.query;

    const apiKey = process.env.JOOBLE_API_KEY || "aa343263-45dc-41b6-ae9b-daca2467e5d7";
    const url = "https://jooble.org/api/" + apiKey;

    // Build the query string
    let keywords = job_category;
    if (work_from_home && work_from_home !== 'false') {
      keywords += " Remote";
    }

    const payload = {
      keywords: keywords,
      location: location,
      page: "1",
      ResultOnPage: "12"
    };

    if (radius) {
      payload.radius = String(radius);
    }

    // If stipend is provided and is a number, we can add salary
    const numericStipend = parseInt(stipend.replace(/\D/g, ''));
    if (!isNaN(numericStipend) && numericStipend > 0) {
      payload.salary = numericStipend;
    }

    console.log("Starting Jooble API request with payload:", payload);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Jooble API responded with status ${response.status}`);
    }

    const data = await response.json();

    // Transform Jooble data format to what the frontend expects
    const internships = (data.jobs || []).map(job => {
      const isRemote = job.location?.toLowerCase().includes("remote") || 
                       job.title?.toLowerCase().includes("remote") || 
                       work_from_home;
                       
      return {
        title: job.title || "Unknown Position",
        company: job.company || "Unknown Company",
        location: job.location || "Location not specified",
        stipend: job.salary || "Not specified",
        duration: job.type || "Full-time",
        work_from_home: isRemote,
        apply_link: job.link || "#"
      };
    });

    console.log("Jooble API request completed, found", internships.length, "results.");

    res.json({ 
      count: internships.length, 
      internships: internships,
      message: "Internships fetched successfully"
    });

  } catch (error) {
    console.error("Error running Jooble API:", error.message);
    
    // Provide fallback dummy data
    const dummyData = [
      {
        title: "Software Engineering Intern",
        company: "Google",
        location: "Remote",
        stipend: "₹50000 /month",
        duration: "6 months",
        work_from_home: true,
        apply_link: "https://internshala.com"
      },
      {
        title: "Frontend Developer Intern",
        company: "Microsoft",
        location: "Bangalore",
        stipend: "₹40000 /month",
        duration: "3 months",
        work_from_home: false,
        apply_link: "https://internshala.com"
      },
      {
        title: "Full Stack Web Developer Intern",
        company: "Amazon",
        location: "Hyderabad",
        stipend: "₹60000 /month",
        duration: "2 months",
        work_from_home: false,
        apply_link: "https://internshala.com"
      },
      {
        title: "React Developer Intern",
        company: "Netflix",
        location: "Remote",
        stipend: "₹30000 /month",
        duration: "3 months",
        work_from_home: true,
        apply_link: "https://internshala.com"
      }
    ];

    return res.json({ 
      count: dummyData.length, 
      internships: dummyData,
      message: "Fallback: Internships fetched successfully (Mock Data due to API Error)"
    });
  }
}; 