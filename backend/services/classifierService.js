/**
 * Intelligent Document Classification Engine
 * Analyzes document filename, title, and metadata to classify into 
 * standard Indian family document categories and specific types with confidence scoring.
 */

const CLASSIFICATION_RULES = [
  // Vehicle / Automobile
  {
    category: 'Vehicle',
    documentType: 'Vehicle Insurance',
    patterns: [/vehicle.*insur/i, /motor.*insur/i, /car.*insur/i, /bike.*insur/i, /two.*wheeler/i, /four.*wheeler/i, /policy.*bazaar/i, /icici.*lombard/i, /bajaj.*allianz.*motor/i, /hdfc.*ergo.*car/i],
    confidence: 0.95
  },
  {
    category: 'Vehicle',
    documentType: 'Registration Certificate (RC)',
    patterns: [/rc/i, /reg.*cert/i, /registration.*certificate/i, /vahan/i, /parivahan/i, /chassis/i],
    confidence: 0.92
  },
  {
    category: 'Vehicle',
    documentType: 'Driving License',
    patterns: [/driving.*licen[sc]e/i, /dl[\s_-]/i, /driver.*licen[sc]e/i, /sarathi/i],
    confidence: 0.96
  },
  {
    category: 'Vehicle',
    documentType: 'Pollution Under Control (PUC)',
    patterns: [/puc/i, /pollution/i, /emission/i],
    confidence: 0.90
  },

  // Identity / Government
  {
    category: 'Identity',
    documentType: 'Aadhaar Card',
    patterns: [/aadhaar/i, /aadhar/i, /uidai/i, /e-aadhaar/i],
    confidence: 0.98
  },
  {
    category: 'Identity',
    documentType: 'PAN Card',
    patterns: [/pan.*card/i, /pan[\s_-]/i, /nsdl/i, /utiitsl/i, /permanent.*account.*number/i],
    confidence: 0.97
  },
  {
    category: 'Identity',
    documentType: 'Passport',
    patterns: [/passport/i, /republic.*india.*passport/i, /tatkaal/i],
    confidence: 0.96
  },
  {
    category: 'Identity',
    documentType: 'Voter ID',
    patterns: [/voter.*id/i, /epic/i, /election.*commission/i, /matdata/i],
    confidence: 0.94
  },
  {
    category: 'Identity',
    documentType: 'Ration Card',
    patterns: [/ration.*card/i, /nfsa/i, /khadya/i],
    confidence: 0.91
  },

  // Insurance
  {
    category: 'Insurance',
    documentType: 'Health Insurance',
    patterns: [/health.*insur/i, /mediclaim/i, /star.*health/i, /care.*health/i, /niva.*bupa/i, /tpa/i, /cashless.*card/i],
    confidence: 0.95
  },
  {
    category: 'Insurance',
    documentType: 'Life / Term Insurance',
    patterns: [/life.*insur/i, /lic/i, /term.*insur/i, /max.*life/i, /hdfc.*life/i, /prulife/i, /endowment/i],
    confidence: 0.94
  },

  // Education
  {
    category: 'Education',
    documentType: 'Degree Certificate',
    patterns: [/degree/i, /convocation/i, /graduation/i, /diploma.*cert/i, /bachelor/i, /master/i, /btech/i, /mtech/i, /mba/i],
    confidence: 0.93
  },
  {
    category: 'Education',
    documentType: 'Academic Marksheet',
    patterns: [/marksheet/i, /mark.*sheet/i, /cbse/i, /icse/i, /grade.*card/i, /10th/i, /12th/i, /transcript/i, /semester/i],
    confidence: 0.94
  },
  {
    category: 'Education',
    documentType: 'College / School Fee Receipt',
    patterns: [/fee.*receipt/i, /tuition/i, /admission.*fee/i, /college.*fee/i, /school.*fee/i],
    confidence: 0.91
  },

  // Financial / Employment
  {
    category: 'Financial',
    documentType: 'Bank Statement',
    patterns: [/bank.*statement/i, /account.*statement/i, /sbi.*stmt/i, /hdfc.*stmt/i, /icici.*stmt/i, /passbook/i],
    confidence: 0.92
  },
  {
    category: 'Financial',
    documentType: 'Income Tax Return (ITR)',
    patterns: [/itr/i, /income.*tax/i, /form.*16/i, /tax.*computation/i, /acknowledgement.*itr/i],
    confidence: 0.95
  },
  {
    category: 'Employment',
    documentType: 'Salary Slip',
    patterns: [/salary.*slip/i, /payslip/i, /pay.*slip/i, /wage/i],
    confidence: 0.94
  },
  {
    category: 'Employment',
    documentType: 'Employment Offer / Relieving Letter',
    patterns: [/offer.*letter/i, /relieving.*letter/i, /experience.*letter/i, /appointment.*letter/i],
    confidence: 0.90
  },

  // Property / Utilities
  {
    category: 'Property',
    documentType: 'Sale Deed / Registry',
    patterns: [/sale.*deed/i, /registry/i, /possession/i, /allotment.*letter/i, /stamp.*duty/i, /patta/i],
    confidence: 0.92
  },
  {
    category: 'Property',
    documentType: 'Rent Agreement',
    patterns: [/rent.*agreement/i, /lease.*agreement/i, /tenancy/i],
    confidence: 0.94
  },
  {
    category: 'Property',
    documentType: 'Electricity / Water Bill',
    patterns: [/electricity.*bill/i, /power.*bill/i, /water.*bill/i, /bses/i, /tata.*power/i, /uppcl/i, /bescom/i, /utility.*bill/i],
    confidence: 0.93
  },

  // Warranty
  {
    category: 'Warranty',
    documentType: 'Appliance Warranty Card',
    patterns: [/warranty/i, /guarantee/i, /invoice.*tv/i, /invoice.*fridge/i, /amc/i, /extended.*warranty/i],
    confidence: 0.90
  }
];

function classifyDocument(fileName, title = '', notes = '') {
  const combinedText = `${fileName} ${title} ${notes}`.toLowerCase();

  for (const rule of CLASSIFICATION_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(combinedText)) {
        return {
          suggestedCategory: rule.category,
          suggestedDocType: rule.documentType,
          confidence: Math.round(rule.confidence * 100),
          matchedPattern: pattern.toString(),
          rationale: `Detected keyword matches corresponding to standard ${rule.documentType} records.`
        };
      }
    }
  }

  // Fallback heuristic based on generic extensions or generic words
  if (/tax|gst|pan|itr/i.test(combinedText)) {
    return {
      suggestedCategory: 'Financial',
      suggestedDocType: 'Tax Document',
      confidence: 72,
      rationale: 'Identified financial/tax terminology.'
    };
  }

  return {
    suggestedCategory: 'Other',
    suggestedDocType: 'General Document',
    confidence: 50,
    rationale: 'Could not confidently match a specific category. Please select below.'
  };
}

module.exports = { classifyDocument };
