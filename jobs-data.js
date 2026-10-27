// Openings shared by the listing (jobs.js) and the detail page (job.js)
// Placeholder roles — replace with the real openings (or fetch from the ATS)
var CK_JOBS = [
  { id: "senior-product-manager", category: "Product & Growth", title: "Senior Product Manager", type: "Full time", location: "Delhi" },
  { id: "growth-marketing-manager", category: "Product & Growth", title: "Growth Marketing Manager", type: "Full time", location: "Gurugram" },
  { id: "senior-backend-engineer", category: "Engineering", title: "Senior Backend Engineer", type: "Full time", location: "Gurugram" },
  { id: "frontend-engineer", category: "Engineering", title: "Frontend Engineer", type: "Full time", location: "Gurugram" },
  { id: "senior-product-designer", category: "Design", title: "Senior Product Designer", type: "Full time", location: "Gurugram" },
  { id: "affiliate-partnerships-lead", category: "Business", title: "Affiliate Partnerships Lead", type: "Full time", location: "Delhi" },
  { id: "category-manager", category: "Business", title: "Category Manager", type: "Full time", location: "Gurugram" },
  { id: "copywriter", category: "Marketing", title: "Copywriter", type: "Full time", location: "Gurugram" },
  { id: "social-media-manager", category: "Marketing", title: "Social Media Manager", type: "Full time", location: "Delhi" },
  { id: "data-analyst", category: "Data & Analytics", title: "Data Analyst", type: "Full time", location: "Gurugram" },
  { id: "customer-support-lead", category: "Customer Experience", title: "Customer Support Lead", type: "Full time", location: "Gurugram" },
  { id: "finance-manager", category: "Finance", title: "Finance Manager", type: "Full time", location: "Gurugram" }
];

// Detail page copy (Figma 263:31515). A role can set its own about / responsibilities / applyUrl;
// until the real job descriptions are in, every role falls back to this sample
var CK_JOB_DEFAULTS = {
  applyUrl: "#",
  about:
    "As a SDE - 2 (Data Platform), you will be part of the Data Platforms team, building scalable and reliable data solutions. You will work on challenging engineering problems, contribute to high-impact projects, and help drive innovation across the platform. This is a hands-on coding role requiring strong technical expertise and problem-solving skills.",
  responsibilities: [
    "Trino query governance and abuse prevention",
    "AI-based anomaly detection using Apache Flink",
    "Designing and maintaining self-healing, SLA-driven pipelines",
    "Building an LLMOps platform using Ray and MLflow",
    "Creating zero-SQL tooling for pipeline automation",
    "Optimizing performance and cost across Spark jobs and EKS clusters",
    "Building a central governance layer and organizational data maps"
  ]
};

// Company-wide section, the same on every role. Items with `items` render as a nested list
var CK_LIFE = [
  {
    text: "Life so good, you’d think we’re kidding:",
    items: [
      "Competitive salaries. Period.",
      "An extensive medical insurance that looks out for our employees & their dependents. We’ll love you and take care of you, our promise.",
      "Flexible working hours. Just don’t call us at 3AM, we like our sleep schedule.",
      "Tailored vacation & leave policies so that you enjoy every important moment in your life.",
      "A reward system that celebrates hard work and milestones throughout the year. Expect a gift coming your way anytime you kill it here.",
      "Learning and upskilling opportunities. Seriously, not kidding.",
      "Good food, games, and a cool office to make you feel like home. An environment so good, you’ll forget the term “colleagues can’t be your friends”."
    ]
  },
  { text: "We believe in equality. Period." },
  {
    text: "At CashKaro, we are committed to building a diverse and talented workforce. We never discriminate on the basis of race, sex, religion, colour, national origin, gender, gender identity, sexual orientation, age, marital status, veteran status, medical condition, disability, or any other class or characteristic protected by the applicable law."
  },
  {
    text: "We consider all qualified job-seekers with criminal histories in a manner consistent with the applicable law. Additionally, we are committed to providing reasonable accommodations to qualified individuals with physical or mental disabilities in order to participate in the job application or interview process, perform essential job functions, and receive other benefits and privileges of employment."
  }
];
