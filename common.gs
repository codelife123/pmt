const APP_NAME = ""
const ID = "1nsaWWreFGZwj6R2tpkCWzU-aOGYsGxwZJ3SSGbkaPY0" // backend spreadsheet id
const COLUMNS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

const LABELS = {
    firstname: "Name",
    lastname: "Surname",
    fullname: "Full name",
    position: "Current position",
    eid: "Employee ID",
    id: "UUID",
    email: "Email",
    password: "Password",
    manager: "Manager",
    managerEmail: "Manager email",
    isManager: "Is manager",
    joinDate: "Date of join",
    birthDate: "Date of birth",
    yearlyLeaves: "Yearly leaves",
    accumulatedLeaves: "Accumulated leaves to date",
    unusedLeaves: "Unused and lost leaves to date",
    usedLeaves: "Used leaves to date",
    leftLeaves: "Left leaves to use",
    leaveStartDate: "Leave start date",
    leaveEndDate: "Leave end date",
    numOfWorkingDays: "Number of working days",
    status: "Status",
    comments: "Comments",
    createdDate: "Created date",
    leaveType: "Leave type",
    token: "Token",
    objective: "Objective",
    keyResults: "Key results",
    quarter: "Quarter",
    startDate: "Start date",
    endDate: "End date",
    dueDate: "Due date",
    delivered: "% Delivered",
    timeTrack: "Time track",
    leaves: "All leaves",
    okrs: "All OKRs",
    filter: "Filter",
}

const ICONS = {
    firstname: "person",
    lastname: "person",
    fullname: "person",
    position: "work",
    eid: "fingerprint",
    id: "fingerprint",
    email: "email",
    password: "lock_open",
    manager: "supervisor_account",
    managerEmail: "supervisor_account",
    isManager: "supervisor_account",
    joinDate: "event",
    birthDate: "cake",
    yearlyLeaves: "flight_takeoff",
    accumulatedLeaves: "flight_takeoff",
    unusedLeaves: "flight_takeoff",
    usedLeaves: "flight_takeoff",
    leftLeaves: "flight_takeoff",
    leaveStartDate: "event",
    leaveEndDate: "event",
    numOfWorkingDays: "flight_takeoff",
    status: "brightness_4",
    comments: "comment",
    createdDate: "event",
    leaveType: "flight_takeoff",
    token: "vpn_key",
    objective: "track_changes",
    keyResults: "analytics",
    quarter: "date_range",
    startDate: "date_range",
    endDate: "date_range",
    dueDate: "today",
    delivered: "hourglass_bottom",
    timeTrack: "query_builder",
    leaves: "flight_takeoff",
    okrs: "track_changes",
    filter: "filter_alt",
}

const SS = SpreadsheetApp.openById(ID)
const SN_EMPLOYEES = "Employee Repository"
const WS_EMPLOYEES = SS.getSheetByName(SN_EMPLOYEES)
const KEYS_EMPLOYEES = [
    "firstname",
    "lastname",
    "position",
    "eid",
    "joinDate",
    "birthDate",
    "email",
    "managerEmail",
    "yearlyLeaves",
    "accumulatedLeaves",
    "unusedLeaves",
    "usedLeaves",
    "leftLeaves"
]

const SN_LEAVES = "Leave Repository"
const WS_LEAVES = SS.getSheetByName(SN_LEAVES)
const KEYS_LEAVES = [
    "eid",
    "firstname",
    "lastname",
    "email",
    "managerEmail",
    "leaveStartDate",
    "leaveEndDate",
    "numOfWorkingDays",
    "status",
    "comments",
    "createdDate",
    "leaveType",
    "id"
]

const SN_PASSWORD = "Passwords"
const WS_PASSWORD = SS.getSheetByName(SN_PASSWORD)
const KEYS_PASSWORD = [
    "email",
    "eid",
    "password"
]

// const SN_OKRS = "OKRs"
const WS_OKRS = SS.getSheetByName(SN_OKRS)
const KEYS_OKRS = [
    "firstname",
    "lastname",
    "position",
    "eid",
    "email",
    "managerEmail",
    "objective",
    "keyResults",
    "quarter",
    "dueDate",
    "delivered",
    "timeTrack",
    "comments",
    "status",
    "createdDate",
    "id"
]

/**
 * Evalute an html temlpate and insert it to another html file
 * @param {string} filename
 */
function include(filename) {
    return HtmlService.createTemplateFromFile(filename).evaluate().getContent()
}

/**
 * Standard function fro google apps script web app project
 * @param {event object} e
 */
function doGet(e) {
    let template = HtmlService.createTemplateFromFile("html/index")
    let htmlOuput = template.evaluate()

    // set title
    let title = APP_NAME
    htmlOuput.setTitle(title)

    // set viewport meta tag
    let name = "viewport"
    let content = "width=device-width,initial-scale=1,minimal-ui"
    htmlOuput.addMetaTag(name, content)

    // set x frame option mode
    htmlOuput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)

    return htmlOuput
}


/**
* convert a string to camel case
* @param {text} text
*/
function toCamelCase(text) {
    let pascalCase = text.trim().toLowerCase().split(" ")
        .filter(word => word != "")
        .map(word => word[0].toUpperCase() + word.slice(1))
        .join("")
    return pascalCase[0].toLowerCase() + pascalCase.slice(1)
}

/**
* Create token and save to cache
*/
function createToken(key) {
    const uuid = Utilities.getUuid()
    const token = Utilities.base64EncodeWebSafe("ashtonfei-" + uuid + "-ashtonfei")
    const scriptCache = CacheService.getScriptCache()
    const expirationInSeconds = 6 * 60 * 60
    scriptCache.put(token, key, expirationInSeconds)
    return token
}

/**
* destroy token
*/
function destroyToken(token) {
    CacheService.getScriptCache().remove(token)
}

/**
* validate token
*/
function validateToken(token) {
    const scriptCache = CacheService.getScriptCache()
    const key = scriptCache.get(token)
    return key
}

/**
 * parse cell value as array
 */
function parseArray(string) {
    try {
        return JSON.parse(string)
    } catch (e) {
        return []
    }
}


// apis for front end
const signIn = (email, password) => JSON.stringify(new App().signIn(email, password))

const signOut = (token) => JSON.stringify(new App().signOut(token))

const getAppData = (token) => JSON.stringify(new App().getAppData(token))


const addNewOkr = (item) => {
    item = JSON.parse(item)
    const app = new App()
    app.createItem(item, SN_OKRS, DB_ID)
    return JSON.stringify(app.getItemsByEmail(item.email, SN_OKRS, DB_ID))
}

const updateOkr = (item) => {
    item = JSON.parse(item)
    const app = new App()
    app.updateItemByUuid(item, SN_OKRS, DB_ID)
    return JSON.stringify(app.getItemsByEmail(item.email, SN_OKRS, DB_ID))
}


const applyNewLeave = (item) => {
    item = JSON.parse(item)
    const app = new App()
    app.createItem(item, SN_LEAVE_REPO, DB_ID)
    app.sendApprovalEmail(item)
    return JSON.stringify({
        leaves: app.getItemsByEmail(item.email, SN_LEAVE_REPO, DB_ID),
        leaveSummary: app.getItemByEmail(item.email, SN_LEAVE_SUMMARY, DB_ID),
    })
}

const updateLeave = (item) => {
    item = JSON.parse(item)
    const app = new App()
    app.updateItemByUuid(item, SN_LEAVE_REPO, DB_ID)
    return JSON.stringify({
        leaves: app.getItemsByEmail(item.email, SN_LEAVE_REPO, DB_ID),
        leaveSummary: app.getItemByEmail(item.email, SN_LEAVE_SUMMARY, DB_ID)
    })
}

const updateProfile = (item) => {
    item = JSON.parse(item)
    const app = new App()
    app.updateItemByEmail(item, SN_EMPLOYEE_PROFILE, DB_ID_CREDENTIALS)
    return JSON.stringify(app.getItemByEmail(item.email, SN_EMPLOYEE_PROFILE, DB_ID_CREDENTIALS))
}

const downloadSalaryCertificate = email => new App().downloadSalaryCertificate(email)