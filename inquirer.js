const inquirer = require('inquirer')
const term = require('terminal-kit').terminal

const {
  listVerifications,
  getVerification,
  createVerification,
  getCompany,
  cancelVerification,
  selectVerification,
} = require('./twapi')

const mainPrompt = (options, cmd) => {
  const ascii = `
 $$$$$$$$\\                                                              $$\\        $$$$$$\\  $$\\       $$$$$$\\ 
 \\__$$  __|                                                             $$ |      $$  __$$\\ $$ |      \\_$$  _|
    $$ | $$$$$$\\  $$\\   $$\\  $$$$$$\\  $$\\  $$\\  $$\\  $$$$$$\\   $$$$$$\\  $$ |  $$\\ $$ /  \\__|$$ |        $$ |  
    $$ |$$  __$$\\ $$ |  $$ |$$  __$$\\ $$ | $$ | $$ |$$  __$$\\ $$  __$$\\ $$ | $$  |$$ |      $$ |        $$ |  
    $$ |$$ |  \\__|$$ |  $$ |$$$$$$$$ |$$ | $$ | $$ |$$ /  $$ |$$ |  \\__|$$$$$$  / $$ |      $$ |        $$ |  
    $$ |$$ |      $$ |  $$ |$$   ____|$$ | $$ | $$ |$$ |  $$ |$$ |      $$  _$$<  $$ |  $$\\ $$ |        $$ |  
    $$ |$$ |      \\$$$$$$  |\\$$$$$$$\\ \\$$$$$\\$$$$  |\\$$$$$$  |$$ |      $$ | \\$$\\ \\$$$$$$  |$$$$$$$$\\ $$$$$$\\ 
    \\__|\\__|       \\______/  \\_______| \\_____\\____/  \\______/ \\__|      \\__|  \\__| \\______/ \\________|\\______|

`
  term(ascii)
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
          'Lookup a company ID',
          'Cancel a Verification Request',
        ],
      },
    ])
    .then((answers) => {
      switch (answers.option) {
        case 'Create a new verification request':
          createPrompt(options, cmd)
          break
        case 'Get a list of verification requests':
          listVerifications(options, cmd)
          break
        case 'Lookup a company ID':
          inquirer
            .prompt({
              type: 'input',
              name: 'company_name',
              message: 'What company would you like to search for?',
            })
            .then((answers) => {
              getCompany(answers.company_name, options, cmd)
              mainPrompt(options, cmd)
            })
            .catch((error) => {
              console.error(error)
            })
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
              getVerification(answers.verification_id, options, cmd)
            })
            .catch((error) => {
              console.error(error)
            })
          break
        case 'Cancel a Verification Request':
          //TODO: List only verifications that are cancellable
          selectVerification(options, cmd).then((verification_id) => {
            inquirer
              .prompt([
                {
                  type: 'list',
                  name: 'reason',
                  message: 'Verification Cancellation Reason?',
                  choices: [
                    'immediate',
                    'high-turnaround-time',
                    'competitor',
                    'wrong-info',
                    'other',
                  ],
                },
                {
                  type: 'input',
                  name: 'detail',
                  message: 'Cancellation memo',
                },
              ])
              .then((answers) => {
                cancelVerification(verification_id, answers, cmd)
              })
          })
      }
    })
    .catch((error) => {
      console.error(error)
    })
}

// Create Verification Prompt
const createPrompt = (options, cmd) => {
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
        message: `'Target's Company'`,
      },
      {
        type: 'input',
        name: 'first_name',
        message: `'Target's first name'`,
      },
      {
        type: 'input',
        name: 'last_name',
        message: `'Target's last name'`,
      },
      {
        type: 'input',
        name: 'ssn',
        message: `'Target's SSN'`,
      },
      {
        type: 'input',
        name: 'dob',
        message: `'Target's DOB (YYYY-MM-DD) (Optional)'`,
      },
    ])
    .then((answers) => {
      // console.log(answers)
      let options = {
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
      createVerification(options, cmd)
    })
    .catch((error) => {
      console.error(error)
    })
}

module.exports = { mainPrompt }
