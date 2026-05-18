const config = require('../../config');
const { AppError } = require('../../middleware/error');

/**
 * AI Content Generation Service
 * Uses OpenAI API when available, falls back to template-based generation
 */

// Template-based fallback for when no API key is configured
const generateWithTemplate = (product) => {
  const { name, brand, attributes, price } = product;
  const priceRupees = (price / 100).toLocaleString('en-IN');
  const shape = attributes?.frameShape || 'classic';
  const material = attributes?.frameMaterial || 'premium';
  const gender = attributes?.gender || 'unisex';
  const uv = attributes?.uvProtection || 'UV400';

  const description = `Elevate your style with the ${name} from ${brand}. These ${shape} sunglasses feature a ${material} frame crafted for ${gender === 'unisex' ? 'everyone' : gender}. With ${uv} protection, your eyes stay safe while you look effortlessly cool. Lightweight, durable, and designed for the Indian climate — perfect for sunny days, road trips, and making a statement. Starting at ₹${priceRupees}.`;

  const seoTitle = `${name} | ${brand} ${shape.charAt(0).toUpperCase() + shape.slice(1)} Sunglasses | Vyamoh`;
  const seoDescription = `Shop ${name} by ${brand}. ${shape.charAt(0).toUpperCase() + shape.slice(1)} ${material} sunglasses with ${uv} protection for ${gender}. Free shipping & easy returns. Buy online at Vyamoh.`;
  const keywords = [brand.toLowerCase(), shape, material, gender, 'sunglasses', 'eyewear', 'uv protection', name.toLowerCase().split(' ').join(', ')];

  return { description, seoTitle, seoDescription, keywords };
};

// OpenAI-based generation
const generateWithAI = async (product) => {
  const apiKey = config.openai.apiKey;
  if (!apiKey || apiKey.startsWith('sk-your')) {
    return null; // API not configured
  }

  try {
    const prompt = `You are an expert ecommerce copywriter for an Indian fashion eyewear brand called Vyamoh.

Generate the following for this product:
- Product Name: ${product.name}
- Brand: ${product.brand}
- Frame Shape: ${product.attributes?.frameShape || 'N/A'}
- Frame Material: ${product.attributes?.frameMaterial || 'N/A'}
- Gender: ${product.attributes?.gender || 'unisex'}
- UV Protection: ${product.attributes?.uvProtection || 'UV400'}
- Price: ₹${(product.price / 100).toLocaleString('en-IN')}

Please provide a JSON response with:
1. "description" - A compelling 100-150 word product description (conversational, aspirational, India-focused)
2. "seoTitle" - SEO-optimized page title (max 60 chars)
3. "seoDescription" - Meta description (max 155 chars)
4. "keywords" - Array of 8-10 relevant SEO keywords

Respond ONLY with valid JSON.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      return JSON.parse(data.choices[0].message.content);
    }
    return null;
  } catch (error) {
    console.error('OpenAI generation error:', error.message);
    return null;
  }
};

/**
 * Generate product content — tries AI first, falls back to templates
 */
const generateProductContent = async (product) => {
  // Try AI first
  const aiContent = await generateWithAI(product);
  if (aiContent) return { ...aiContent, source: 'ai' };

  // Fallback to templates
  return { ...generateWithTemplate(product), source: 'template' };
};

/**
 * Generate Instagram-ready product caption
 */
const generateInstagramCaption = (product) => {
  const { name, brand, attributes, price } = product;
  const priceRupees = (price / 100).toLocaleString('en-IN');

  return `✨ ${name} by ${brand}\n\n` +
    `${attributes?.frameShape ? `🕶️ ${attributes.frameShape.charAt(0).toUpperCase() + attributes.frameShape.slice(1)} frame` : '🕶️ Premium eyewear'}\n` +
    `${attributes?.uvProtection ? `☀️ ${attributes.uvProtection} protection` : ''}\n` +
    `💰 Starting at ₹${priceRupees}\n\n` +
    `Shop now → Link in bio 🛒\n\n` +
    `#Vyamoh #Sunglasses #IndianFashion #Eyewear #StyleStatement ` +
    `#${brand.replace(/\s/g, '')} #FashionIndia #SunglassesLover`;
};

module.exports = { generateProductContent, generateInstagramCaption };
