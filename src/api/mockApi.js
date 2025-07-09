// Mock responses for different policy types
const policyResponses = {
  dress_code: {
    answer: "The dress code policy requires business professional attire Monday through Thursday, and business casual on Fridays. Professional attire includes suits, dresses, or coordinated separates. Business casual allows neat, clean clothing including khakis and collared shirts. Prohibited items include jeans, t-shirts, and athletic wear.",
    suggestions: [
      "What is considered business casual?",
      "Are there exceptions to the dress code?",
      "What happens if someone violates the dress code?",
      "Is there a separate dress code for client meetings?"
    ]
  },
  leave: {
    answer: "CGI offers various types of leave including Contingency Leave (CL), Privilege Leave (PL), Unpaid Leave (UPL), Maternity Leave (ML), Paternity Leave (PTL), Bereavement Leave (BL), and Annual Health Checkup Leave. Each type has specific eligibility criteria and duration.",
    suggestions: [
      "How many casual leaves do I get per year?",
      "What is the process for applying for leave?",
      "How do I check my leave balance?",
      "What documents are needed for medical leave?"
    ]
  },
  health: {
    answer: "The health policy includes annual health checkups, medical insurance coverage for employees and dependents, and wellness programs. Employees are entitled to one health checkup leave per year.",
    suggestions: [
      "How do I claim medical insurance?",
      "What is the coverage amount for dependents?",
      "How do I book a health checkup?",
      "What is the process for medical reimbursement?"
    ]
  }
};

// Helper function to identify policy type from question
const identifyPolicyType = (question) => {
  question = question.toLowerCase();
  if (question.includes('dress') || question.includes('attire') || question.includes('wear')) {
    return 'dress_code';
  } else if (question.includes('leave') || question.includes('vacation') || question.includes('time off')) {
    return 'leave';
  } else if (question.includes('health') || question.includes('medical') || question.includes('insurance')) {
    return 'health';
  }
  return null;
};

// Mock API response function
export const getResponse = async (question) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const policyType = identifyPolicyType(question);
  
  if (policyType && policyResponses[policyType]) {
    return policyResponses[policyType];
  }

  // Default response if no specific policy is identified
  return {
    answer: "I can help you with information about CGI's policies including dress code, leave management, health benefits, and more. Please ask a specific question about any policy you'd like to know more about.",
    suggestions: [
      "Tell me about the dress code policy",
      "What are the different types of leave?",
      "How does the health insurance policy work?",
      "What is the leave application process?"
    ]
  };
};

export default getResponse; 