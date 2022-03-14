#!/usr/bin/env node

require('dotenv').config();
const { Command, Option } = require('commander');
const { mainPrompt } = require('./inquirer');
const {createVerification, getCompany, getVerification, listVerifications} = require('./twapi');
const program = new Command();

if (!process.env.TW_TOKEN) {
    console.error('TW_TOKEN environment variable is not set\nPlease define one in .env or $ trueworkapi TW_TOKEN=<token>');
    process.exit(1);
}

program
  .option('-v, --verbose', 'Verbose output')
  .option('--production', 'Production environment')
  .description('CLI for Truework')
  .action(() => {mainPrompt()})

// List Verifications
program
  .command('list')
  .addOption(
    new Option('--state').choices([
      'pending-approval',
      'action-required',
      'invalid',
      'processing',
      'completed',
      'canceled',
    ])
  )
  .option('-l, --limit <limit>', 'Limit the number of results', '25')
  .option('-o, --offset <offset>', 'Offset the results', '0')
  .action((options, cmd) => {listVerifications(options, cmd)}
 );

// Get Verification
program
  .command('get')
  .argument('<verification_id>')
  .action((verification_id, options, cmd) => getVerification(verification_id, options, cmd));


// Create Verifications
program
  .command('create')
  .description('Create Verification')
  .addOption(
    new Option('--type <type>', 'Request type')
      .choices(['employment-income', 'employment'])
      .default('employment')
  )
  .addOption(
    new Option(
      '--purpose <purpose>',
      'A valid purpose is required for Truework to process the verification request.'
    ).choices([
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
    ])
  )
  .option('--instant', 'Instant Verification', true)
  .option(' --credentials', 'Credentials Verification')
  .option('--smart-outreach', 'Smart Outreach Verification')
  .requiredOption('-f, --first_name <first_name>', 'First Name')
  .requiredOption('-l, --last_name <last_name>', 'Last Name')
  .requiredOption('--ssn <ssn>', 'Social Security Number')
  .requiredOption('-c, --company <company>', 'Company Name')
  .option('--email [email]', 'Email')
  .option('--phone [phone]', 'Phone')
  .action((options, cmd) => createVerification(options, cmd));

program
  .command('companies')
  .description('Company queries')
  .argument('<company_name>')
  .option('-l, --limit', 'Limit the number of results', '25')
  .option('--offset')
  .action((company_name, options, cmd) => getCompany(company_name, options, cmd));

program.parse();
