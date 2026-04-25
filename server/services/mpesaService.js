const axios = require('axios');

const DARAJA_SANDBOX_URL = 'https://sandbox.safaricom.co.ke';
const DARAJA_PRODUCTION_URL = 'https://api.safaricom.co.ke';

function getBaseUrl() {
  return process.env.MPESA_ENVIRONMENT === 'production'
    ? DARAJA_PRODUCTION_URL
    : DARAJA_SANDBOX_URL;
}

/**
 * Get M-Pesa OAuth token
 */
async function getAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error('M-Pesa credentials not configured');
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await axios.get(
    `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 15000,
    }
  );

  return response.data.access_token;
}

/**
 * Initiate STK Push (C2B) for deposits
 */
async function initiateSTKPush(phone, amount, accountReference) {
  const token = await getAccessToken();
  const shortcode = process.env.MPESA_SHORTCODE || '174379';
  const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

  // Normalize phone number to 254XXXXXXXXX format
  let normalizedPhone = phone.replace(/\s+/g, '');
  if (normalizedPhone.startsWith('+')) normalizedPhone = normalizedPhone.substring(1);
  if (normalizedPhone.startsWith('0')) normalizedPhone = '254' + normalizedPhone.substring(1);

  const callbackUrl = `${process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/mpesa'}/stk-callback`;

  const response = await axios.post(
    `${getBaseUrl()}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: normalizedPhone,
      PartyB: shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference || 'OmokaBet',
      TransactionDesc: 'OmokaBet Deposit',
    },
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000,
    }
  );

  return response.data;
}

/**
 * Initiate B2C payout for withdrawals
 */
async function initiateB2C(phone, amount, occasion) {
  const token = await getAccessToken();
  const shortcode = process.env.MPESA_B2C_SHORTCODE || process.env.MPESA_SHORTCODE;
  const initiatorName = process.env.MPESA_B2C_INITIATOR || 'testapi';
  const initiatorPassword = process.env.MPESA_B2C_PASSWORD || '';

  let normalizedPhone = phone.replace(/\s+/g, '');
  if (normalizedPhone.startsWith('+')) normalizedPhone = normalizedPhone.substring(1);
  if (normalizedPhone.startsWith('0')) normalizedPhone = '254' + normalizedPhone.substring(1);

  const callbackUrl = `${process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/mpesa'}/b2c-callback`;

  const response = await axios.post(
    `${getBaseUrl()}/mpesa/b2c/v3/paymentrequest`,
    {
      OriginatorConversationID: `OmokaBet-${Date.now()}`,
      InitiatorName: initiatorName,
      SecurityCredential: initiatorPassword,
      CommandID: 'BusinessPayment',
      Amount: Math.round(amount),
      PartyA: shortcode,
      PartyB: normalizedPhone,
      Remarks: 'OmokaBet Withdrawal',
      QueueTimeOutURL: `${callbackUrl}/timeout`,
      ResultURL: callbackUrl,
      Occasion: occasion || 'Withdrawal',
    },
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000,
    }
  );

  return response.data;
}

module.exports = {
  getAccessToken,
  initiateSTKPush,
  initiateB2C,
};
