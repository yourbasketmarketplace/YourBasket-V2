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
        id: new Date().getTime(),
        currency: 'KES',
        amount: 100,
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

