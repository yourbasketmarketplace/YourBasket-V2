const axios = require('axios');

exports.pesapal = async (data = {}) => {
  const configKey = {
    consumer_key: 'qkio1BGGYAXTu2JOfm7XSXNruoZsrqEW',
    consumer_secret: 'osGQ364R49cXKeOYSpaOnT++rHs=',
  };
  try {
    const tokenData = await axios.post('https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken', configKey);

    let postdata = {
      url: `https://api.yourbasket.co.ke/api/payment/ipn?user_id=${data.user_id}&address_id=${data.addressId}`,
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
        id: ipnData.data.id,
        currency: 'KES',
        amount: 100,
        description: 'Payment description goes here',
        callback_url: 'https://yourbasket.co.ke/#/myorder',
        cancellation_url: 'https://yourbasket.co.ke/#/checkout',
        notification_id: ipnData.data.ipn_id,
        billing_address: {
          email_address: 'tiwari5076@gmail.com',
          phone_number: '8360047165',
          country_code: '91',
          first_name: 'Pawan',
          middle_name: '',
          last_name: 'tiwari',
          line_1: 'dsds',
          line_2: 'sdf',
          city: 'chandigarh',
          state: 'chandigarh',
          postal_code: '160101',
          zip_code: '160101',
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

