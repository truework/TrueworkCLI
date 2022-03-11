let environment = 'https://api.truework-sandbox.com'
const axios = require('axios')

const TOKEN = process.env.TW_TOKEN

const getVerification = (verification_id) => {
  axios({
    method: 'get',
    url: `${environment}/verification-requests/${verification_id}`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `Bearer ${TOKEN}`,
    },
  })
    .then(({ data }) => {
      console.dir(data, { depth: null, colors: true })
    })
    .catch((err) => {
      if (err.response.status === 400) {
        console.log(`Verification ${verification_id} not found`)
      } else {
        console.error(err)
      }
    })
}

const listVerifications = (options, cmd) => {
  params = {
    limit: options.limit || 10,
    offset: options.offset || 0,
    state: options.state || '',
  }
  axios({
    method: 'get',
    url: `${environment}/verification-requests/`,
    params: params,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `Bearer ${TOKEN}`,
    },
  })
    .then(({ data, config }) => {
      // if (cmd.optsWithGlobals().verbose) {
      //   console.log(config);
      //   console.log(cmd.optsWithGlobals());
      // }
      console.dir(data, { depth: null, colors: true })
    })
    .catch((err) => {
      console.error(err)
    })
}

const createVerification = (options) => {
  let verification = {
    type: options.type,
    permissible_purpose: options.purpose,
    target: {
      social_security_number: options.ssn,
      company: {
        name: options.company,
      },
      first_name: options.first_name,
      last_name: options.last_name,
    },
    request_parameters: {
      verification_methods: {
        instant: {
          enabled: false,
        },
        credentials: {
          enabled: false,
        },
        smart_outreach: {
          enabled: false,
        },
      },
    },
  }
  if (options.dob) {
    verification.target.date_of_birth = options.dob
  }
  if (options.instant) {
    verification.request_parameters.verification_methods.instant.enabled = true
  }
  if (options.credentials) {
    verification.request_parameters.verification_methods.credentials.enabled = true
  }
  if (options.smart_outreach) {
    verification.request_parameters.verification_methods.smart_outreach.enabled = true
  }
  axios({
    method: 'post',
    url: `${environment}/verification-requests`,
    data: verification,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `Bearer ${TOKEN}`,
    },
  })
    .then(({ data }) => {
      console.dir(data, { depth: null, colors: true })
    })
    .catch((err) => {
      console.dir(verification, { depth: null, colors: true })
      console.dir(err.response.data, { depth: null, colors: true })
    })
}

const getCompany = (company_name, options) => {
  axios({
    method: 'get',
    url: `${environment}/companies`,
    params: {
      q: company_name,
      limit: options.limit,
      offset: options.offset,
    },
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `Bearer ${TOKEN}`,
    },
  })
    .then(({ data }) => {
      console.log(data)
    })
    .catch((err) => {
      console.error(err)
    })
}

module.exports = {
  listVerifications,
  getCompany,
  createVerification,
  getVerification,
}
