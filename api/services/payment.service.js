const axios = require('axios');
const moment = require('moment');
const CryptoJS = require('crypto-js');

exports.pesapal = async (data = {}) => {
  const configKey = {
    consumer_key: 'qkio1BGGYAXTu2JOfm7XSXNruoZsrqEW',
    consumer_secret: 'osGQ364R49cXKeOYSpaOnT++rHs=',
  };
  try {
    const tokenData = await axios.post('https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken', configKey);

    let postdata = {
      url: `https://api.yourbasket.co.ke/api/payment/ipn?user_id=${data.user_id}&address_id=${data.addressId}&amount=${data.totalAmount}&item_amount=${data.item_amount}&tax_amount=${data.tax_amount}&payment_menthod='Pesapal'&sale_type=${data.sale_type}`,
      ipn_notification_type: 'GET',
    };

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenData.data.token}`,
      },
      data: postdata,
    };

    const ipnData = await axios.request(config);
    if (ipnData.data) {
      config.method = 'get';
      config.url = 'https://cybqa.pesapal.com/pesapalv3/apiURLSetup/GetIpnList';
      await axios.request(config);
      postdata = {
        id: new Date().getTime(),
        currency: 'KES',
        amount: data.totalAmount,
        description: 'Payment description goes here',
        callback_url: 'https://yourbasket.co.ke/#/myorders',
        cancellation_url: 'https://yourbasket.co.ke/#/checkout',
        notification_id: ipnData.data.ipn_id,
        billing_address: {
          email_address: data.user.email,
          phone_number: data.user.phone,
          country_code: '+91',
          first_name: data.user.first_name,
          middle_name: data.user.middle_name,
          last_name: data.user.last_name,
          line_1: '',
          line_2: '',
          city: data.user.city,
          state: data.user.state,
          postal_code: data.user.zipcode,
          zip_code: data.user.zipcode,
        },
      };
      config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenData.data.token}`,
        },
        data: postdata,
      };
      const resultData = await axios.request(config);
      if (resultData.data.error) {
        return {
          error: resultData.data.error.message,
          success: false,
        };
      }
      return {
        error: '',
        success: true,
        data: resultData.data,
      };
    }
  } catch (err) {
    return {
      error: 'Someting went wrong',
      success: false,
    };
  }
};
exports.pesapalTransactionSatus = async (orderTrackingId = {}) => {
  const configKey = {
    consumer_key: 'qkio1BGGYAXTu2JOfm7XSXNruoZsrqEW',
    consumer_secret: 'osGQ364R49cXKeOYSpaOnT++rHs=',
  };
  try {
    const tokenData = await axios.post('https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken', configKey);
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenData.data.token}`,
      },
    };

    const transactionData = await axios.request(config);
    return transactionData;
  } catch (err) {
    return {
      error: 'Someting went wrong',
      success: false,
    };
  }
};

exports.mpesa = async (data = {}) => {
  try {
    const consumerKey = 'ToDO6k8kjGoNcs7sI5cCQhLmO11Wtxyl';
    const consumerSecret = 'nAVDGbv563EpfXFZ';
    const auth = new Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const config = {
      method: 'get',
      url: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    };
    // 254708374149
    const tokenData = await axios.request(config);
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const shortCode = '174379';
    const paymentUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    const password = new Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
    const postData = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: (data.totalAmount) ? data.totalAmount : 1,
      PartyA: `254${data.user.phone}`,
      PartyB: 174379,
      PhoneNumber: `254${data.user.phone}`,
      CallBackURL: `https://api.yourbasket.co.ke/api/order/mpesa?user_id=${data.user_id}&address_id=${data.addressId}&amount=${data.totalAmount}&item_amount=${data.item_amount}&tax_amount=${data.tax_amount}&payment_menthod='Mpesa'&sale_type=${data.sale_type}`,
      AccountReference: 'CompanyXLTD',
      TransactionDesc: 'Payment of X',
    };
    config.url = paymentUrl;
    config.method = 'Post';
    config.data = postData;
    config.headers.Authorization = `Bearer ${tokenData.data.access_token}`;
    const paymentData = await axios.request(config);
    return { error: false, data: paymentData.data };
  } catch (error) {
    return { error: true, data: 'Invalid phone number' };
  }
};

exports.mpesaQuery = async (CheckoutRequestID = {}) => {
  try {
    const consumerKey = 'ToDO6k8kjGoNcs7sI5cCQhLmO11Wtxyl';
    const consumerSecret = 'nAVDGbv563EpfXFZ';
    const auth = new Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const config = {
      method: 'get',
      url: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    };
    // 254708374149
    const tokenData = await axios.request(config);
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const shortCode = '174379';
    const queryUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query';
    const password = new Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
    const postData = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID,
    };
    config.url = queryUrl;
    config.method = 'Post';
    config.data = postData;
    config.headers.Authorization = `Bearer ${tokenData.data.access_token}`;
    const paymentData = await axios.request(config);
    return { error: false, data: paymentData.data };
  } catch (error) {
    return { error: true, data: error };
  }
};
exports.ipay = async (data = {}) => {
  const invNumber = moment().format('YYYYMMDDHHmmss');
  const apiUrl = 'https://apis.ipayafrica.com/payments/v2/transact';
  const hashKey = 'demoCHANGED';
  const params = {
    live: 0,
    oid: `ORD122${invNumber}`,
    inv: invNumber,
    amount: (data.totalAmount) ? data.totalAmount : 1,
    tel: `254${data.user.phone}`,
    eml: data.user.email,
    vid: 'demo',
    curr: 'KES',
    p1: 'airtel',
    p2: '020102292999',
    p3: '',
    p4: '900',
    cst: 1,
    cbk: `https://api.yourbasket.co.ke/api/order/ipayafrica?user_id=${data.user_id}&address_id=${data.addressId}&amount=${data.totalAmount}&item_amount=${data.item_amount}&tax_amount=${data.tax_amount}&payment_menthod='Mpesa'&sale_type=${data.sale_type}`,
  };
  const hashData = Object.values(params)
    .filter((value) => value !== '')
    .join('');

  const key = CryptoJS.enc.Utf8.parse(hashKey);
  const timestamp = CryptoJS.enc.Utf8.parse(hashData);
  params.hash = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(timestamp, key));
  try {
    const paymentData = await axios.post(apiUrl, params);
    console.log(paymentData);
    return { error: false, data: paymentData.data };
  } catch (error) {
    console.log(error)
    return { error: true, data: 'Invalid phone number' };
  }
};

