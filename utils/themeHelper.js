// Theme parsing helpers to map Tailwind CSS utility classes to React Native style values

export const getThemeColor = (classStr, defaultColor = '#000000') => {
  if (!classStr) return defaultColor;
  // Match hex codes in classes like bg-[#1E1E1E], text-[#61AFEF], border-[#3E3E42]
  const match = classStr.match(/#(?:[0-9a-fA-F]{3,4}){1,2}\b/);
  return match ? match[0] : defaultColor;
};

export const getThemeRadius = (radiusStr, defaultRadius = 8) => {
  if (!radiusStr) return defaultRadius;
  if (radiusStr.includes('rounded-none')) return 0;
  if (radiusStr.includes('rounded-sm')) return 4;
  if (radiusStr.includes('rounded-md')) return 6;
  if (radiusStr.includes('rounded-lg')) return 8;
  if (radiusStr.includes('rounded-xl')) return 12;
  if (radiusStr.includes('rounded-2xl')) return 16;
  if (radiusStr.includes('rounded-3xl')) return 24;
  if (radiusStr.includes('rounded-full')) return 999;
  
  // Custom Tailwind brackets like rounded-[20px] or rounded-[40px]
  const match = radiusStr.match(/rounded-\[(\d+)px\]/);
  return match ? parseInt(match[1], 10) : defaultRadius;
};
