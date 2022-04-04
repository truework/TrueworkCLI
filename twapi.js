var term = require('terminal-kit').terminal
const moment = require('moment')
var inquirer = require('inquirer')
const fs = require('fs')

const { truework, REQUEST_SYNC_STRATEGIES } = require('@truework/sdk')

const getVerification = async (verification_id, options, cmd) => {
  // I really hate tw being initalized for each function, but I can't figure out to ensure it's initalized with the right environment

  const tw = truework({
    baseURL: cmd.optsWithGlobals().baseURL,
    token: process.env.TW_TOKEN,
  })
  try {
    const response = await tw.verifications.getOne({ id: verification_id })
    prettyPrintVerification(response.body)
    if (cmd.optsWithGlobals().verbose) {
      verbose(response)
    }
  } catch (err) {
    verbose(err.response)
    if (cmd.optsWithGlobals().verbose) {
      console.dir(err) // error
    }
  }
}

const listVerifications = async (options, cmd) => {
  const tw = truework({
    baseURL: cmd.optsWithGlobals().baseURL,
    token: process.env.TW_TOKEN,
  })
  try {
    const params = {
      limit: parseInt(options.limit || 10),
      offset: parseInt(options.offset || 0),
      state: options.state || '',
    }
    const response = await tw.verifications.get(params)
    if (cmd.optsWithGlobals().verbose) {
      verbose(response)
    } else {
      prettyPrintVerification(response.body.results)
    }
    // Pagination
    if (params.offset + params.limit < response.body.count) {
      term.red(`Items: ${params.offset}-${params.offset + params.limit}\n`)
      const answers = await inquirer.prompt([
        { type: 'confirm', name: 'nextPage', message: 'Next Page?' },
      ])
      if (answers.nextPage == true) {
        options.limit = params.limit
        options.offset = params.offset + params.limit
        listVerifications(options, cmd)
      }
    }
  } catch (err) {
    verbose(err.response)
    if (cmd.optsWithGlobals().verbose) {
      console.dir(err) // error
    }
  }
}

const selectVerification = async (options, cmd) => {
  const tw = truework({
    token: process.env.TW_TOKEN,
    baseURL: cmd.optsWithGlobals().baseURL,
  })
  const params = {
    limit: parseInt(options.limit || 10),
    offset: parseInt(options.offset || 0),
    state: options.state || '',
  }
  try {
    const { body } = await tw.verifications.get(params)
    const verification_readable_list = body.results.map((item) =>
      [
        item.id,
        item.target.first_name,
        item.target.last_name,
        item.created,
      ].join(' ')
    )
    verification_readable_list.push('Next Page')
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'purpose',
        message: 'Select verification request:',
        choices: verification_readable_list,
      },
    ])
    if (answer.purpose === 'Next Page') {
      options.limit = params.limit
      options.offset = params.offset + params.limit
      return selectVerification(options, cmd)
    }
    return body.results.filter(
      (item) => item.id == answer.purpose.split(' ')[0]
    )[0].id
  } catch (err) {
    if (err.response && err.response.status === 400) {
      if (cmd.optsWithGlobals().verbose) {
        console.log(err.response.statusCode) // error response status code
        console.log(err.response.body) // error response body
      }
    } else {
      console.log(err.response.statusCode) // error response status code
      console.log(err.response.body) // error response body
    }
  }
}

const createVerification = async (options, cmd) => {
  const tw = truework({
    token: process.env.TW_TOKEN,
    baseURL: cmd.optsWithGlobals().baseURL,
  })
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
  try {
    const response = await tw.verifications.create(
      verification,
      options.sync
        ? {
            strategy: REQUEST_SYNC_STRATEGIES.SYNC,
          }
        : null
    )
    prettyPrintVerification(response.body)
    if (cmd.optsWithGlobals().verbose) {
      verbose(response)
    }
  } catch (err) {
    console.dir(verification, { depth: null, colors: true }) // request body

    verbose(err.response) // response
    if (cmd.optsWithGlobals().verbose) {
      console.dir(err) // error
    }
  }
}

const importFile = async (filePath, options, cmd) => {
  const tw = truework({
    token: process.env.TW_TOKEN,
    baseURL: cmd.optsWithGlobals().baseURL,
  })
  let data = ''
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
  try {
    const response = await tw.verifications.create(
      data,
      options.sync
        ? {
            strategy: REQUEST_SYNC_STRATEGIES.SYNC,
          }
        : null
    )
    prettyPrintVerification(response.body)
    if (cmd.optsWithGlobals().verbose) {
      verbose(response)
    }
  } catch (err) {
    verbose(err.response)
    if (cmd.optsWithGlobals().verbose) {
      console.dir(err) // error
    }
  }
}

const getCompany = async (company_name, options, cmd) => {
  const tw = truework({
    token: process.env.TW_TOKEN,
    baseURL: cmd.optsWithGlobals().baseURL,
  })
  let params = {
    query: company_name,
    limit: parseInt(options.limit || 10),
    offset: parseInt(options.offset || 0),
  }
  try {
    const { body } = await tw.companies.get(params)
    if (body.count == 0) {
      console.log(`Company ${company_name} not found`)
      process.exit(1)
    }
    const headers = Object.keys(body.results[0])
    const values = body.results.map((company) => Object.values(company))
    term.table([headers].concat(values), {
      firstRowTextAttr: { bgColor: 'gray' },
    })
    if (params.offset + params.limit < body.count) {
      term.red(`Items: ${params.offset}-${params.offset + params.limit}\n`)
      const answers = await inquirer.prompt([
        { type: 'confirm', name: 'nextPage', message: 'Next Page?' },
      ])
      if (answers.nextPage == true) {
        options.limit = params.limit
        options.offset = params.offset + params.limit
        getCompany(company_name, options, cmd)
      }
    }
  } catch (err) {
    verbose(err.response)
  }
}

const cancelVerification = async (verification_id, options, cmd) => {
  const tw = truework({
    token: process.env.TW_TOKEN,
    baseURL: cmd.optsWithGlobals().baseURL,
  })
  try {
    const { body } = await tw.verifications.cancel({
      id: verification_id,
      cancellation_reason: options.reason,
      cancellation_details: options.details,
    })
    prettyPrintVerification(body)
    if (cmd.optsWithGlobals().verbose) {
      console.dir(body, { depth: null, colors: true })
    }
  } catch (err) {
    verbose(err.response)
  }
}

const reverifyVerification = async (
  verification_id,
  report_id,
  options,
  cmd
) => {
  try {
    const tw = truework({
      token: process.env.TW_TOKEN,
      baseURL: cmd.optsWithGlobals().baseURL,
    })
    const { body } = await tw.verificationsrever({
      id: verification_id,
      report_id: report_id,
    })
    prettyPrintVerification(body)

    if (cmd.optsWithGlobals().verbose) {
      console.dir(body, { depth: null, colors: true })
    }
  } catch (err) {
    verbose(err.response)
  }
}

module.exports = {
  listVerifications,
  getCompany,
  createVerification,
  getVerification,
  importFile,
  cancelVerification,
  reverifyVerification,
  selectVerification,
}

// Formatting
const prettyPrintVerification = (list) => {
  if (list.id) {
    list = [list]
  }
  // console.debug(list, { depth: null, colors: true })
  list.forEach((item) => {
    term.bold(`${item.target.first_name} ${item.target.last_name}\n`)
    term(
      `\t^+SSN^:: ${item.target.social_security_number} ^+Company^:: ${item.target.company.name}\n`
    )
    term(`\t^+Verification ID^:: ${item.id}\n`)

    switch (item.state) {
      case 'action-required':
        term.blue(`\tState: ${item.state}\n`)
        break
      case 'invalid':
        term.brighRed(`\tState: ${item.state}\n`)
        break
      case 'pending-approval':
        term.cyan(`\t^+State^:: ${item.state}\n`)
        break
      case 'canceled':
        term.red(`\t^+State^:: ${item.state}\n`)
        break
      case 'processing':
        term.brightYellow(`\t^+State^:: ${item.state}\n`)
        break
      case 'completed':
        term.green(`\t^+State^:: ${item.state}\n`)
        break
      default:
        term(`\t^+State^:: ${item.state}\n`)
    }
    term.bold('\tCreated: ')
    term(`${moment(item.created).format('LLLL')} `)
    if (item.date_of_completion) {
      term.bold('Completed: ')
      term(`${moment(item.date_of_completion).format('LLLL')}, `)
      term.bold('Time Elapsed: ')
      term(
        `${moment(item.date_of_completion).diff(
          moment(item.created),
          'minutes'
        )}m\n`
      )
    } else {
      term('\n')
    }
    //Reports
    if (item.reports) {
      item.reports.forEach((report) => {
        prettyPrintReport(report)
      })
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
        term('\n')
      }
    })
  }
  if (report.employee.salary) {
    term(
      `\t\tEmployee Salary: ${formatter.format(
        report.employee.salary.gross_pay
      )} ${report.employee.salary.pay_frequency}\n`
    )
  }
  if (report.employee.earnings) {
    formatEarnings(report.employee.earnings)
  }
}

const formatEarnings = (earnings) => {
  if (earnings.length == 0) {
    return 'N/A'
  }
  let formatted = []
  const headers = Object.keys(earnings[0])
  const values = earnings.map((value) => Object.values(value))
  // TODO: Format the values in the table
  term.table([headers].concat(values), {
    firstRowTextAttr: { bgColor: 'gray' },
    width: 80,
  })
  return formatted.join(', ')
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const verbose = (response) => {
  console.dir(response?.request?.requestUrl, { depth: null, colors: true })
  console.dir(response?.statusCode, { depth: null, colors: true })
  console.dir(response?.headers, { depth: null, colors: true })
  console.dir(response?.body, { depth: null, colors: true })
}
