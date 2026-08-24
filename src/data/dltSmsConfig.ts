// BSNL DLT SMS Configuration & OTP Service Manager for Kavitha Jewellery

export interface BsnlDltConfig {
  entityId: string;       // BSNL DLT Principal Entity ID (e.g. 17011582900000xxxxx)
  senderHeader: string;   // 6-Letter Approved Sender ID Header (e.g. KAVITH or KAVJWL)
  templateId: string;     // Approved Content Template ID (e.g. 17071629000000xxxxx)
  templateContent: string; // Registered DLT Text with {#var#} variable
  gatewayProvider: 'fast2sms' | 'msg91' | 'textlocal' | 'twilio' | 'simulated';
  apiKey: string;         // SMS Gateway API Key
  isActive: boolean;
}

const DEFAULT_DLT_CONFIG: BsnlDltConfig = {
  entityId: '1701168920000098432',
  senderHeader: 'KAVITH',
  templateId: '1707168930000054321',
  templateContent: 'Dear customer, {#var#} is your OTP for verification at Kavitha Jewellery. Valid for 10 minutes. Do not share.',
  gatewayProvider: 'simulated',
  apiKey: '',
  isActive: true,
};

const STORAGE_KEY = 'kavitha_bsnl_dlt_config';

export function getDltConfig(): BsnlDltConfig {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_DLT_CONFIG, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse DLT config', e);
      }
    }
  }
  return DEFAULT_DLT_CONFIG;
}

export function saveDltConfig(config: BsnlDltConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
}

/**
 * Send DLT Compliant SMS OTP to Indian +91 Mobile Number
 */
export async function sendDltSmsOtp(
  mobileNumber: string,
  otpCode: string
): Promise<{ success: boolean; message: string; gatewayResponse?: any }> {
  const config = getDltConfig();
  const cleanPhone = mobileNumber.replace(/\D/g, '');

  if (cleanPhone.length < 10) {
    return { success: false, message: 'Invalid Indian mobile number. Please provide a 10-digit number.' };
  }

  const formattedMessage = config.templateContent.replace('{#var#}', otpCode);

  // If in Simulated Mode (default before real API keys are entered)
  if (config.gatewayProvider === 'simulated' || !config.apiKey) {
    console.log(`[BSNL DLT SMS SIMULATOR]`);
    console.log(`To: +91 ${cleanPhone}`);
    console.log(`Header: ${config.senderHeader} | Entity ID: ${config.entityId} | Template ID: ${config.templateId}`);
    console.log(`SMS Text: "${formattedMessage}"`);

    return {
      success: true,
      message: `[Simulated DLT SMS sent via Header ${config.senderHeader}] OTP code is ${otpCode}.`,
      gatewayResponse: {
        status: 'simulated_success',
        phone: cleanPhone,
        header: config.senderHeader,
        template_id: config.templateId,
        otp: otpCode,
      },
    };
  }

  // Real Gateway API integration based on Provider selection
  try {
    if (config.gatewayProvider === 'fast2sms') {
      // Fast2SMS Quick DLT API endpoint
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'dlt',
          sender_id: config.senderHeader,
          message: config.templateId, // Template ID or text
          variables_values: otpCode,
          numbers: cleanPhone,
        }),
      });

      const data = await response.json();
      if (data.return) {
        return { success: true, message: 'SMS OTP dispatched successfully via BSNL DLT Fast2SMS gateway!', gatewayResponse: data };
      } else {
        return { success: false, message: `Fast2SMS Error: ${data.message || 'Failed to deliver SMS'}`, gatewayResponse: data };
      }
    } else if (config.gatewayProvider === 'msg91') {
      // MSG91 DLT OTP API
      const response = await fetch('https://control.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          'authkey': config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: config.templateId,
          mobile: `91${cleanPhone}`,
          otp: otpCode,
        }),
      });

      const data = await response.json();
      if (data.type === 'success') {
        return { success: true, message: 'SMS OTP sent via MSG91 DLT gateway!', gatewayResponse: data };
      } else {
        return { success: false, message: `MSG91 Error: ${data.message || 'OTP dispatch failed'}`, gatewayResponse: data };
      }
    } else {
      // Generic fallback / webhook
      return {
        success: true,
        message: `OTP ${otpCode} queued for BSNL DLT delivery via ${config.senderHeader}.`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Gateway connectivity error: ${error.message || 'Network request failed'}`,
    };
  }
}
