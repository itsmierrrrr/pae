export const marketTemplates = {
  marketA: {
    name: 'General Online Listing',
    requirements: ['productName', 'category', 'material', 'dimensions'],
  },
  marketB: {
    name: 'Institutional / Government',
    requirements: ['productName', 'description', 'material', 'weight', 'careInstructions'],
  },
  marketC: {
    name: 'Social Commerce Catalog',
    requirements: ['productName', 'shortDescription', 'usage', 'images'],
  },
};

export const buildMarketPack = (passport = {}, marketKey = 'marketA') => {
  const identity = passport.identity || passport;
  const template = marketTemplates[marketKey] || marketTemplates.marketA;
  const base = {
    marketKey,
    marketName: template.name,
    requirements: template.requirements,
    title: identity.productName || passport.productName || passport.title || 'Handcrafted Product',
    shortDescription: passport.descriptions?.short || passport.description || '',
    detailedDescription: passport.descriptions?.detailed || passport.description || '',
    summary: passport.descriptions?.short || passport.description || '',
    material: passport.materials?.[0] || identity.material || null,
    category: identity.category || passport.category || null,
    usage: passport.usage || identity.usage || [],
    careInstructions: passport.careInstructions || identity.careInstructions || null,
    dimensions: passport.dimensions || null,
    weight: passport.weight || null,
    images: passport.images || (passport.imageUrl ? [passport.imageUrl] : []),
    attributes: {
      material: passport.materials?.[0] || null,
      dimensions: passport.dimensions || null,
      weight: passport.weight || null,
      usage: passport.usage || [],
      careInstructions: passport.careInstructions || null,
    },
    tags: [passport.materials?.[0], identity.category, ...(passport.usage || [])].filter(Boolean),
    presentationNotes: marketKey === 'marketB' ? 'Use a concise specification-led presentation.' : marketKey === 'marketC' ? 'Lead with a short, visual, use-case-led presentation.' : 'Lead with the product story and confirmed attributes.',
  };

  return {
    ...base,
    validation: {
      required: template.requirements,
      missing: template.requirements.filter((field) => {
        if (field === 'productName') return !base.title;
        if (field === 'category') return !base.category;
        if (field === 'material') return !base.material;
        if (field === 'dimensions') return !passport.dimensions || !Object.values(passport.dimensions || {}).some(Boolean);
        if (field === 'weight') return !passport.weight || !passport.weight.value;
        if (field === 'careInstructions') return !base.careInstructions;
        if (field === 'usage') return !base.usage?.length;
        if (field === 'images') return !base.images?.length;
        return false;
      }),
    },
  };
};
