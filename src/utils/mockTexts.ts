
export const sampleArticles = [
  {
    title: "The Future of Artificial Intelligence",
    text: `Artificial intelligence (AI) is transforming how we live, work, and interact with technology. From voice assistants to autonomous vehicles, AI systems are becoming increasingly integrated into our daily lives. Recent advancements in machine learning, particularly deep learning, have accelerated this trend, enabling computers to perform tasks that once required human intelligence.

One of the most significant developments in AI is the emergence of large language models (LLMs). These models, trained on vast amounts of text data, can generate human-like text, translate languages, write different kinds of creative content, and answer questions in an informative way. They represent a step toward artificial general intelligence, though they still have limitations in reasoning and factual accuracy.

AI is also making strides in healthcare, with algorithms that can detect diseases from medical images with accuracy that rivals or exceeds that of human doctors. In transportation, self-driving cars are becoming increasingly capable, promising to reduce accidents and transform urban mobility. In scientific research, AI is accelerating discovery by predicting protein structures, helping design new materials, and simulating complex physical systems.

However, the rapid advancement of AI also raises important ethical and societal concerns. Issues of bias in AI systems, privacy implications of data collection, potential job displacement, and questions about AI governance and safety require careful consideration. As AI becomes more powerful, ensuring that these systems align with human values and benefit humanity broadly becomes increasingly important.

Looking ahead, the future of AI will likely involve more sophisticated systems that can reason, learn, and adapt in ways that more closely resemble human intelligence. This could lead to powerful tools that help solve some of humanity's most pressing challenges, from climate change to healthcare accessibility. However, realizing this potential will require collaboration among researchers, policymakers, industry leaders, and the public to ensure that AI development proceeds responsibly and equitably.`
  },
  {
    title: "The Impact of Climate Change on Global Ecosystems",
    text: `Climate change is altering Earth's ecosystems at an unprecedented rate, with far-reaching consequences for biodiversity and human well-being. Rising global temperatures, changing precipitation patterns, and increasing frequency of extreme weather events are disrupting ecological balances that have evolved over millennia.

Marine ecosystems are particularly vulnerable to climate impacts. Ocean warming and acidification, both direct results of increased atmospheric carbon dioxide, are threatening coral reefs—often called the rainforests of the sea. These vibrant underwater ecosystems provide habitat for about 25% of all marine species and support the livelihoods of millions of people. Current projections suggest that without significant reductions in greenhouse gas emissions, most of the world's coral reefs could disappear within this century.

Terrestrial ecosystems are also experiencing dramatic shifts. In Arctic regions, warming is occurring at twice the global average rate, leading to thawing permafrost and changing vegetation patterns. This affects not only local wildlife like polar bears and caribou but also has global implications as thawing permafrost releases stored carbon, potentially accelerating climate change further. In tropical regions, changing rainfall patterns and deforestation are threatening rainforests, which are critical carbon sinks and biodiversity hotspots.

Climate change is also altering the timing of seasonal biological events—a phenomenon known as phenological shifts. For instance, plants may flower earlier, migratory birds may arrive at breeding grounds sooner, and insects may emerge earlier in the spring. These changes can disrupt ecological relationships, such as those between pollinators and plants or predators and prey, with cascading effects throughout food webs.

The biodiversity crisis exacerbated by climate change has profound implications for human societies as well. Ecosystem services—the benefits that nature provides to people—are being compromised. These include food provision, water purification, flood control, and climate regulation. Indigenous communities and those directly dependent on natural resources for their livelihoods are especially vulnerable to these changes.

Addressing these challenges requires both mitigation strategies to reduce greenhouse gas emissions and adaptation measures to help ecosystems and communities cope with unavoidable changes. Conservation approaches are evolving to account for changing conditions, with increasing emphasis on maintaining ecological connectivity to allow species migrations, protecting climate refugia where impacts may be less severe, and in some cases, considering assisted migration for species unable to adapt quickly enough on their own.

While the situation is urgent, there are reasons for hope. Natural ecosystems have remarkable resilience if given the chance to adapt. Moreover, nature-based solutions—such as protecting and restoring forests, wetlands, and other carbon-rich ecosystems—can simultaneously address both climate change and biodiversity loss. These approaches, combined with rapid decarbonization of our energy systems and economies, offer pathways to a more sustainable future where both human communities and natural ecosystems can thrive.`
  }
];

export const getRandomSampleArticle = () => {
  const randomIndex = Math.floor(Math.random() * sampleArticles.length);
  return sampleArticles[randomIndex];
};
