export const isPassportValueMissing = (value) => value === null
  || value === undefined
  || value === ''
  || (Array.isArray(value) && value.length === 0)
  || (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);

export const getPassportMissingFields = (passport = {}) => [
  ['productName', passport.identity?.productName || passport.productName],
  ['category', passport.identity?.category || passport.category],
  ['material', passport.materials || (passport.material ? [passport.material] : null)],
  ['dimensions', passport.dimensions],
  ['weight', passport.weight],
  ['craftingTime', passport.craft?.craftingTime],
  ['usage', passport.usage],
  ['careInstructions', passport.careInstructions],
].filter(([, value]) => isPassportValueMissing(value)).map(([field]) => field);