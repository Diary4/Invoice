export type AmountLanguage = "english" | "arabic" | "kurdish"

// English number to words conversion
const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
const teens = [
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
]
const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

function convertHundreds(num: number): string {
  let result = ""
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + " hundred"
    num %= 100
    if (num > 0) result += " "
  }
  if (num >= 20) {
    result += tens[Math.floor(num / 10)]
    num %= 10
    if (num > 0) result += "-" + ones[num]
  } else if (num >= 10) {
    result += teens[num - 10]
  } else if (num > 0) {
    result += ones[num]
  }
  return result
}

function numberToWordsEnglish(num: number): string {
  if (num === 0) return "zero"
  if (num < 0) return "negative " + numberToWordsEnglish(-num)

  let result = ""
  const billions = Math.floor(num / 1_000_000_000)
  const millions = Math.floor((num % 1_000_000_000) / 1_000_000)
  const thousands = Math.floor((num % 1_000_000) / 1_000)
  const hundreds = num % 1_000

  if (billions > 0) {
    result += convertHundreds(billions) + " billion"
    if (millions > 0 || thousands > 0 || hundreds > 0) result += " "
  }
  if (millions > 0) {
    result += convertHundreds(millions) + " million"
    if (thousands > 0 || hundreds > 0) result += " "
  }
  if (thousands > 0) {
    result += convertHundreds(thousands) + " thousand"
    if (hundreds > 0) result += " "
  }
  if (hundreds > 0) {
    result += convertHundreds(hundreds)
  }

  return result.trim()
}

// Arabic number to words conversion
const arabicOnes = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"]
const arabicTeens = [
  "عشرة",
  "أحد عشر",
  "اثنا عشر",
  "ثلاثة عشر",
  "أربعة عشر",
  "خمسة عشر",
  "ستة عشر",
  "سبعة عشر",
  "ثمانية عشر",
  "تسعة عشر",
]
const arabicTens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"]

function convertHundredsArabic(num: number): string {
  let result = ""
  if (num >= 100) {
    if (num === 100) {
      result += "مائة"
    } else if (num === 200) {
      result += "مائتان"
    } else {
      result += arabicOnes[Math.floor(num / 100)]
      if (Math.floor(num / 100) === 1) {
        result += "مائة"
      } else if (Math.floor(num / 100) === 2) {
        result = "مائتان"
      } else {
        result += "مائة"
      }
    }
    num %= 100
    if (num > 0) result += " و"
  }
  if (num >= 20) {
    if (num % 10 > 0) {
      result += arabicOnes[num % 10] + " و" + arabicTens[Math.floor(num / 10)]
    } else {
      result += arabicTens[Math.floor(num / 10)]
    }
  } else if (num >= 10) {
    result += arabicTeens[num - 10]
  } else if (num > 0) {
    result += arabicOnes[num]
  }
  return result
}

function numberToWordsArabic(num: number): string {
  if (num === 0) return "صفر"
  if (num < 0) return "سالب " + numberToWordsArabic(-num)

  let result = ""
  const billions = Math.floor(num / 1_000_000_000)
  const millions = Math.floor((num % 1_000_000_000) / 1_000_000)
  const thousands = Math.floor((num % 1_000_000) / 1_000)
  const hundreds = num % 1_000

  if (billions > 0) {
    result += convertHundredsArabic(billions) + " مليار"
    if (millions > 0 || thousands > 0 || hundreds > 0) result += " و"
  }
  if (millions > 0) {
    result += convertHundredsArabic(millions) + " مليون"
    if (thousands > 0 || hundreds > 0) result += " و"
  }
  if (thousands > 0) {
    if (thousands === 1) {
      result += "ألف"
    } else if (thousands === 2) {
      result += "ألفان"
    } else if (thousands >= 3 && thousands <= 10) {
      result += convertHundredsArabic(thousands) + " آلاف"
    } else {
      result += convertHundredsArabic(thousands) + " ألف"
    }
    if (hundreds > 0) result += " و"
  }
  if (hundreds > 0) {
    result += convertHundredsArabic(hundreds)
  }

  return result.trim()
}

// Kurdish number to words conversion (Sorani dialect)
const kurdishOnes = ["", "یەک", "دوو", "سێ", "چوار", "پێنج", "شەش", "حەوت", "هەشت", "نۆ"]
const kurdishTeens = [
  "دە",
  "یازدە",
  "دوازدە",
  "سیازدە",
  "چواردە",
  "پازدە",
  "شازدە",
  "حەڤدە",
  "هەژدە",
  "نۆزدە",
]
const kurdishTens = ["", "", "بیست", "سی", "چل", "پەنجا", "شەست", "حەفتا", "هەشتا", "نەوەد"]

function convertHundredsKurdish(num: number): string {
  let result = ""
  if (num >= 100) {
    if (num === 100) {
      result += "سەد"
    } else {
      result += kurdishOnes[Math.floor(num / 100)] + " سەد"
    }
    num %= 100
    if (num > 0) result += " و "
  }
  if (num >= 20) {
    if (num % 10 > 0) {
      result += kurdishOnes[num % 10] + " و " + kurdishTens[Math.floor(num / 10)]
    } else {
      result += kurdishTens[Math.floor(num / 10)]
    }
  } else if (num >= 10) {
    result += kurdishTeens[num - 10]
  } else if (num > 0) {
    result += kurdishOnes[num]
  }
  return result
}

function numberToWordsKurdish(num: number): string {
  if (num === 0) return "سفر"
  if (num < 0) return "نێگەتیڤ " + numberToWordsKurdish(-num)

  let result = ""
  const billions = Math.floor(num / 1_000_000_000)
  const millions = Math.floor((num % 1_000_000_000) / 1_000_000)
  const thousands = Math.floor((num % 1_000_000) / 1_000)
  const hundreds = num % 1_000

  if (billions > 0) {
    result += convertHundredsKurdish(billions) + " ملیار"
    if (millions > 0 || thousands > 0 || hundreds > 0) result += " و "
  }
  if (millions > 0) {
    result += convertHundredsKurdish(millions) + " ملیۆن"
    if (thousands > 0 || hundreds > 0) result += " و "
  }
  if (thousands > 0) {
    if (thousands === 1) {
      result += "هەزار"
    } else {
      result += convertHundredsKurdish(thousands) + " هەزار"
    }
    if (hundreds > 0) result += " و "
  }
  if (hundreds > 0) {
    result += convertHundredsKurdish(hundreds)
  }

  return result.trim()
}

export function numberToWords(num: number, language: AmountLanguage, currency: "USD" | "IQD"): string {
  // Handle decimal parts
  const wholePart = Math.floor(num)
  const decimalPart = Math.round((num - wholePart) * 100)

  let result = ""

  // Convert whole number part
  if (wholePart > 0) {
    switch (language) {
      case "english":
        result = numberToWordsEnglish(wholePart)
        break
      case "arabic":
        result = numberToWordsArabic(wholePart)
        break
      case "kurdish":
        result = numberToWordsKurdish(wholePart)
        break
    }
  } else {
    switch (language) {
      case "english":
        result = "zero"
        break
      case "arabic":
        result = "صفر"
        break
      case "kurdish":
        result = "سفر"
        break
    }
  }

  // Add currency name
  if (currency === "USD") {
    switch (language) {
      case "english":
        result += " US dollars"
        break
      case "arabic":
        result += " دولار أمريكي"
        break
      case "kurdish":
        result += " دۆلاری ئەمریکی"
        break
    }
  } else {
    switch (language) {
      case "english":
        result += " Iraqi dinars"
        break
      case "arabic":
        result += " دينار عراقي"
        break
      case "kurdish":
        result += " دیناری عێراقی"
        break
    }
  }

  // Add decimal part if exists
  if (decimalPart > 0 && currency === "USD") {
    switch (language) {
      case "english":
        result += " and " + numberToWordsEnglish(decimalPart) + " cents"
        break
      case "arabic":
        result += " و " + numberToWordsArabic(decimalPart) + " سنت"
        break
      case "kurdish":
        result += " و " + numberToWordsKurdish(decimalPart) + " سەنت"
        break
    }
  }

  // Capitalize first letter for English
  if (language === "english" && result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1)
  }

  return result
}

