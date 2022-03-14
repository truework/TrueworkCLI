let environment = 'https://api.truework-sandbox.com'
const axios = require('axios')
var term = require('terminal-kit').terminal
const moment = require('moment')

let TOKEN = process.env.TW_TOKEN

const getVerification = (verification_id, options, cmd) => {
  if (cmd.optsWithGlobals().production == true) {
    environment = 'https://api.truework.com'
    TOKEN = process.env.TW_TOKEN_PROD
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
      if (cmd.optsWithGlobals().verbose) {
        console.log(cmd.optsWithGlobals())
        console.dir(data, { depth: null, colors: true })
      } else {
        prettyPrintVerification(data)
      }
    })
    .catch((err) => {
      if (err.status === 400) {
        console.log(`Verification ${verification_id} not found`)
      } else {
        console.error(err)
      }
    })
}

const listVerifications = (options, cmd) => {
  if (cmd.optsWithGlobals) {
    if (cmd.optsWithGlobals().production == true) {
      environment = 'https://api.truework.com'
      TOKEN = process.env.TW_TOKEN_PROD
    }
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
      if (cmd.optsWithGlobals) {
        if (cmd.optsWithGlobals().verbose) {
          console.log(config)
          console.log(cmd.optsWithGlobals())
          console.dir(data, { depth: null, colors: true })
        } else {
          prettyPrintVerification(data.results)
        }
      }
    })
    .catch((err) => {
      console.error(err)
    })
}

const prettyPrintVerification = (list) => {
  if (list.id) {
    list = [list]
  }
  // console.dir(list, { depth: null, colors: true })
  list.forEach((item) => {
    term.bold(`${item.target.first_name} ${item.target.last_name}\n`)
    term(
      `\tSSN: ${item.target.social_security_number} Company: ${item.target.company.name}\n`
    )
    term(`\tVerification ID: ${item.id}\n`)
    if (item.reports) {
      item.reports.forEach((report) => {
        prettyPrintReport(report)
      })
    }
    if (item.state === 'processing') {
      term.brightYellow(`\tStatus: ${item.state}\n`)
    } else if (item.state === 'completed') {
      term.green(`\tStatus: ${item.state}\n`)
    } else {
      term(`\tStatus: ${item.state}\n`)
    }
    term.bold(`\tCreated: `)
    term(`${moment(item.created).format('LLLL')} `)
    if (item.date_of_completion) {
      term.bold(`Completed: `)
      term(`${moment(item.date_of_completion).format('LLLL')}, `)
      term.bold(`Time Elapsed: `)
      term(
        `${moment(item.date_of_completion).diff(
          moment(item.created),
          'minutes'
        )}m\n`
      )
    } else {term(`\n`)}
  })
}

const prettyPrintReport = (report) => {
  term.bold(`\tEmployer Name: ${report.employer.name}\n`)
  term(`\t\tEmployee Status: ${report.employee.status}\n`)
  term(`\t\tEmployee Hired Date: ${report.employee.hired_date}\n`)
  if (report.employee.positions.length > 0) {
    report.employee.positions.forEach((position) => {
      term(`\t\tEmployee Position: ${position.title} @ ${position.start_date}`)
      if (position.end_date) {
        term(` - ${position.end_date}\n`)
      } else {
        term(`\n`)
      }
    })
  }
}

const createVerification = (options, cmd) => {
  if (cmd.optsWithGlobals().production == true) {
    environment = 'https://api.truework.com'
    TOKEN = process.env.TW_TOKEN_PROD
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
    environment = 'https://api.truework.com'
    TOKEN = process.env.TW_TOKEN_PROD
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
