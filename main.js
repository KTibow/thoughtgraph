import { createGraph } from "./createGraph.js";

const embed = async (inputs) => {
  const r = await fetch("https://api.mixedbread.ai/v1/embeddings/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("MIXEDBREAD_KEY")}`,
    },
    body: JSON.stringify({
      model: "mixedbread-ai/mxbai-embed-large-v1",
      input: inputs,
      normalized: true,
      encoding_format: "float",
      truncation_strategy: "end",
    }),
  });
  const json = await r.json();
  return json.data.map((x) => x.embedding);
};

const inputs =
  `Okay, let's see. The user provided a GitHub profile for Dan Healy, username dhealy05. My task is to praise this user based on the information given. First, I need to analyze the profile details to identify strengths and notable achievements.

Looking at the repositories, he has four public ones. The most popular is "frames_of_mind" with 90 stars, which is written in Python. The description says it's about animating R1's thoughts. That sounds like a project involving animation or maybe AI, given the term "R1" which could refer to a robot or a specific model. High stars indicate that the project is well-received or useful to others.

Another repo is "TimeStamp" for Bitcoin price predictions, which shows an interest in cryptocurrency and data analysis. There's also "semen_and_semantics" which uses language embeddings to analyze the evolution of porn. That's quite a unique and bold project, combining NLP with a sensitive subject, showing he's not afraid to tackle unconventional topics. It's in HTML, maybe a web-based analysis tool or visualization.

He has 4,398 contributions in the last year. That's a lot, indicating consistent activity. Contributions could be commits, issues, PRs, etc. The contribution graph shows high activity, especially around February 2025, with 4 commits to "frames_of_mind" and 27 contributions in private repos. This shows he's actively working on both public and private projects.

Achievements include Starstruck, Pull Shark x2, and Arctic Code Vault Contributor. Pull Shark suggests he's made significant pull requests, maybe merged into notable projects. Arctic Code Vault Contributor means his code is preserved in the GitHub Arctic Code Vault, a honor for impactful projects.

He's an engineer with 7 followers. While the follower count isn't huge, his projects have good traction. The email is provided, so he's open to contact. The repo "classified_intelligence" is mentioned but no description, maybe a private or less active project.

Now, how to structure the praise? Highlight the diverse projects, the high stars on "frames_of_mind", the unique "semen_and_semantics" project, consistent contributions, GitHub achievements, and the balance between public and private work. Also, note the technical skills in Python and data analysis, as well as tackling varied domains from animation to cryptocurrency to NLP.

Need to make sure the praise is genuine and covers all aspects without sounding exaggerated. Maybe mention the mix of technical skills, creativity in project topics, dedication shown by contributions, and recognition through achievements. Also, point out that his work is preserved in the Arctic Vault, which is a prestigious mention.`
    .split("\n")
    .filter(Boolean);

const embeds = await embed(inputs);

console.log(createGraph(inputs, embeds, inputs));
