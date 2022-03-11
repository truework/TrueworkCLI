#!/usr/bin/env node

require('dotenv').config()
const { Command, Option } = require('commander')
const axios = require('axios')
const program = new Command()
const environment = 'https://api.truework-sandbox.com'
const TOKEN = process.env.TW_TOKEN

program
    .option('-v, --verbose', 'Verbose output')
    .option('--production', 'Production environment')
    .description('CLI for Truework')

const verifications = program.command('verifications')

verifications
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
    .action((options, cmd) => {
        axios({
            method: 'get',
            url: `${environment}/verification-requests/`,
            params: {
                limit: options.limit,
                offset: options.offset,
                state: options.state,
            },
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${TOKEN}`,
            },
        })
            .then(({ data, config }) => {
                if (cmd.optsWithGlobals().verbose) {
                    console.log(config)
                    console.log(cmd.optsWithGlobals())
                }
                console.dir(data, { depth: null, colors: true })
            })
            .catch((err) => {
                console.error(err)
            })
    })

verifications
    .command('get')
    .argument('<verification_id>')
    .action((verification_id) => {
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
    })

verifications
    .command('create')
    .description('Create Verification')
    .addOption(
        new Option('--method <method>', 'Verification Method').choices(
            ['instant','credentials','smart_outreach'])
    )
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
    .requiredOption('-f, --first_name <first_name>', 'First Name')
    .requiredOption('-l, --last_name <last_name>', 'Last Name')
    .requiredOption('--ssn <ssn>', 'Social Security Number')
    .requiredOption('-c, --company <company>', 'Company Name')
    .option('--email [email]', 'Email')
    .option('--phone [phone]', 'Phone')
    .action((options, cmd) => {
    // console.log(options)
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
        if (options.method == 'instant') {
            verification.request_parameters.verification_methods.instant.enabled = true
        }
        if (options.method == 'credentials') {
            verification.request_parameters.verification_methods.credentials.enabled = true
        }
        if (options.smart_outreach == 'smart_outreach') {
            verification.request_parameters.verification_methods.smart_outreach.enabled = true
        }
        if (cmd.optsWithGlobals().verbose) {
            console.dir(verification, { depth: null, colors: true })
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
                console.dir(err.response.data, { depth: null, colors: true })
            })
    })

program
    .command('companies')
    .description('Company queries')
    .argument('<company_name>')
    .option('-l, --limit', 'Limit the number of results', '25')
    .option('--offset')
    .action((company_name, options) => {
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
    })

program.parse()

if (program.opts().production == true) {
    environment = 'https://api.truework.com/'
}
