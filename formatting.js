var term = require('terminal-kit').terminal
const moment = require('moment')

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

module.exports = { prettyPrintReport, prettyPrintVerification }
