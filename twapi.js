let environment = 'https://api.truework-sandbox.com'
const axios = require('axios')

let TOKEN = process.env.TW_TOKEN

const getVerification = (verification_id, options, cmd) => {
  if (cmd.optsWithGlobals().production == true) {
    environment = 'https://api.truework.com';
    TOKEN = process.env.TW_TOKEN_PROD;
  }
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
  if (cmd.optsWithGlobals().production == true) {
    environment = 'https://api.truework.com';
    TOKEN = process.env.TW_TOKEN_PROD;
  }
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
      if (cmd.optsWithGlobals().verbose) {
        console.log(config);
        console.log(cmd.optsWithGlobals());
        console.dir(data, { depth: null, colors: true })
      } else {
        prettyPrintList(data.results)
      }
    })
    .catch((err) => {
      console.error(err)
    })
}

const prettyPrintList = (list) => {
  list.forEach((item) => {
    console.log(
      `${item.target.first_name} ${item.target.last_name}
      SSN: ${item.target.social_security_number} Company: ${item.target.company.name}
      Verification ID: ${item.id}
      Status: ${item.state}`
    )
  })
}

const createVerification = (options, cmd) => {
  if (cmd.optsWithGlobals().production == true) {
    environment = 'https://api.truework.com';
    TOKEN = process.env.TW_TOKEN_PROD;
  }
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
      if (cmd.optsWithGlobals().verbose) {
        console.dir(data, { depth: null, colors: true })
      } else {
        prettyPrintList(data.results)
      }
    })
    .catch((err) => {
      console.dir(verification, { depth: null, colors: true })
      console.dir(err.response.data, { depth: null, colors: true })
    })
}

const getCompany = (company_name, options, cmd) => {
  if (cmd.optsWithGlobals().production == true) {
    environment = 'https://api.truework.com';
    TOKEN = process.env.TW_TOKEN_PROD;
  }
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
