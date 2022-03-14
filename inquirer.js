var inquirer = require('inquirer')
const {
  listVerifications,
  getVerification,
  createVerification,
} = require('./twapi')
const mainPrompt = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'option',
        message: 'What would you like to do?',
        choices: [
          'Create a new verification request',
          'Get a list of verification requests',
          'Get a verification request',
        ],
      },
    ])
    .then((answers) => {
      switch (answers.option) {
        case 'Create a new verification request':
          createPrompt()
          break
        case 'Get a list of verification requests':
          listVerifications({}, {})
          break
        case 'Get a verification request':
          inquirer
            .prompt([
              {
                type: 'input',
                name: 'verification_id',
                message: 'Enter the verification ID',
              },
            ])
            .then((answers) => {
              getVerification(answers.verification_id, {}, {})
            })
      }
    })
    .catch((error) => {
      console.error(error)
    })
}

// Create Verification Prompt
createPrompt = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Which verfication type?',
        choices: ['employment-income', 'employment'],
      },
      {
        type: 'checkbox',
        name: 'methods',
        message: 'Which verfication methods?',
        choices: ['instant', 'credentials', 'smart-outreach'],
      },
      {
        type: 'list',
        name: 'purpose',
        message: 'What is the permissable purpose of this verification?',
        choices: [
          'child-support',
          'credit-application',
          'employee-eligibility',
          'employee-request',
          'employee-review-or-collection',
          'employment',
          'insurance-underwriting-application',
          'legitimate-reason-initiated',
          'legitimate-reason-review',
          'risk-assessment',
          'subpoena',
        ],
      },
      {
        type: 'input',
        name: 'company',
        message: "Target's Company",
      },
      {
        type: 'input',
        name: 'first_name',
        message: "Target's first name",
      },
      {
        type: 'input',
        name: 'last_name',
        message: "Target's last name",
      },
      {
        type: 'input',
        name: 'ssn',
        message: "Target's SSN",
      },
      {
        type: 'input',
        name: 'dob',
        message: "Target's DOB (YYYY-MM-DD)",
      },
    ])
    .then((answers) => {
      console.log(answers)
      options = {
        type: answers.type,
        purpose: answers.purpose,
        company: answers.company,
        first_name: answers.first_name,
        last_name: answers.last_name,
        ssn: answers.ssn,
      }
      if (answers.methods.includes('instant')) {
        options.instant = true
      }
      if (answers.methods.includes('credentials')) {
        options.credentials = true
      }
      if (answers.methods.includes('smart_outreach')) {
        options.smart_outreach = true
      }
      if (answers.dob) {
        options.dob = answers.dob
      }
      createVerification(options, {})
    })
    .catch((error) => {
      console.error(error)
    })
}

module.exports = { mainPrompt }
