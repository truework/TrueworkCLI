const axios = require('axios')
var term = require('terminal-kit').terminal
const moment = require('moment')
var inquirer = require('inquirer')

const getVerification = (verification_id, options, cmd) => {
  axios({
    method: 'get',
    url: `${
      cmd.optsWithGlobals().environment
    }/verification-requests/${verification_id}`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `Bearer ${process.env.TW_TOKEN}`,
    },
  })
    .then(({ data }) => {
      if (cmd.optsWithGlobals().verbose) {
        console.dir(data, { depth: null, colors: true })
      } else {
        prettyPrintVerification(data)
      }
    })
    .catch((err) => {
      if (err.response.status === 400) {
        console.log(`Verification ${verification_id} not found`)
        if (cmd.optsWithGlobals().verbose) {
          console.error(err)
        }
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
    url: `${cmd.optsWithGlobals().environment}/verification-requests/`,
    params: params,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `Bearer ${process.env.TW_TOKEN}`,
    },
  })
    .then(({ data, config }) => {
      if (cmd.optsWithGlobals) {
        if (cmd.optsWithGlobals().verbose) {
          console.log(config)
          console.log(cmd.optsWithGlobals())
          console.dir(data, { depth: null, colors: true })
        }
        prettyPrintVerification(data.results)
        if (params.offset + params.limit <= data.count) {
          inquirer
            .prompt([{ type: 'confirm', name: 'nextPage', message: 'Next Page?' }])
            .then((answers) => {
              if (answers. nextPage == true) {
                options.limit = params.limit
                options.offset = parseInt(params.offset) + parseInt(params.limit)
                listVerifications(options, cmd)
              }
            })
        }
      }
    })
    .catch((err) => {
      if (err.response && err.response.status === 400) {
        console.log(`Verification ${verification_id} not found`)
        if (cmd.optsWithGlobals().verbose) {
          console.error(err)
        }
      } else {
        console.error(err)
      }
    })
}

const selectVerification = (list) => {
  verification_readable_list = list.results.map((item) =>
    [item.id, item.target.first_name, item.target.last_name, item.created].join(
      ' '
    )
  )
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'purpose',
        message: 'Which Validation would you like more information on?',
        choices: verification_readable_list,
      },
    ])
    .then((answer) => {
      console.dir(
        list.results.filter((item) => item.id == answer.purpose.split(' ')[0])
      )
    })
}

const prettyPrintVerification = (list) => {
  if (list.id) {
    list = [list]
  }
  // console.debug(list, { depth: null, colors: true })
  list.forEach((item) => {
    term.bold(`${item.target.first_name} ${item.target.last_name}\n`)
    term(
      `\tSSN: ${item.target.social_security_number} Company: ${item.target.company.name}\n`
    )
    term(`\tVerification ID: ${item.id}\n`)

    switch (item.state) {
      case 'action-required':
        term.blue(`\tState: ${item.state}\n`)
        break
      case 'invalid':
        term.brighRed(`\tState: ${item.state}\n`)
        break
      case 'pending-approval':
        term.cyan(`\tStatus: ${item.state}\n`)
        break
      case 'canceled':
        term.red(`\tStatus: ${item.state}\n`)
        break
      case 'processing':
        term.brightYellow(`\tStatus: ${item.state}\n`)
        break
      case 'completed':
        term.green(`\tStatus: ${item.state}\n`)
        break
      default:
        term(`\tStatus: ${item.state}\n`)
    }
    if (item.reports) {
      item.reports.forEach((report) => {
        prettyPrintReport(report)
      })
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
    } else {
      term(`\n`)
    }
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
    url: `${cmd.optsWithGlobals().environment}/verification-requests`,
    data: verification,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `Bearer ${process.env.TW_TOKEN}`,
    },
  })
    .then(({ data }) => {
      if (cmd.optsWithGlobals().verbose) {
        console.dir(data, { depth: null, colors: true })
      } else {
        prettyPrintVerification(data)
      }
    })
    .catch((err) => {
      console.dir(verification, { depth: null, colors: true })
      console.dir(err, { depth: null, colors: true })
    })
}

const getCompany = (company_name, options, cmd) => {
  isProduction(options, cmd)

  axios({
    method: 'get',
    url: `${cmd.optsWithGlobals().environment}/companies`,
    params: {
      q: company_name,
      limit: options.limit,
      offset: options.offset,
    },
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `Bearer ${process.env.TW_TOKEN}`,
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
