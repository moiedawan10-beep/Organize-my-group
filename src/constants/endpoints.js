export const signUp = 'signup';
export const login = 'login';
export const logout = 'logout';
export const getUserInfo = 'user/me';
export const userProfile = 'user/view';
export const verify = 'verify';
export const forgotpassword = 'auth/forgot';
export const resetpassword = 'auth/reset';
export const creategroup = 'groups/create';
export const checkgroupavailability = 'groups/check-availabilty';
// Set to true to run against the local mock API (see mock-api/README.md).
const USE_MOCK_API = false;
export const BASE_URL = USE_MOCK_API
  ? 'http://localhost:4000/api/'
  : 'http://dev.organizemygroup.com/api/';
// export const BASE_URL = 'https://app.organizemygroup.com/api/';
export const mygroups = 'groups/manage';
export const groupdetails = 'groups/view';
export const searchgroup = 'groups/search';
export const joingroup = 'groups/join';
export const editgroup = 'groups/edit';
export const groupjoinrequest = 'groups/requests';
export const grouprequestapproval = 'groups/approve-membership';
export const grouprequestrejection = 'groups/decline-membership';
export const allmembers = 'groups/members';
export const membersContact = 'groups/contact-members';
export const leavegroup = 'groups/leave';
export const deletegroup = 'groups/delete';
export const deletePaymentsMethod = 'payment/method';
export const hostSelection = 'groups/member/update';
export const createEvent = 'events/create';
export const editEvent = 'events/edit';
export const manageEvents = 'events/manage';
export const eventdetails = 'events/view';
export const upcomingEvents = 'events/upcoming';
export const joinEvent = 'events/join';
export const withdrawEvent = 'events/leave';
export const deleteEvent = 'events/delete';
export const getTemplates = 'events/templates';

export const editProfile = 'user/edit';
export const paymentsMethode = 'payment/methods';
export const paymentsMethodeSelect = 'payment/method';
export const changePassword = 'user/change-password';
export const notifications = 'user/notifications';
export const notificationsRead = 'notifications/mark-all-read';
export const deleteNotification = 'notifications/mark-deleted';
export const deleteUser = 'user/delete';
export const eventMembers = 'events/members';
export const resendCode = 'resend';
export const checkPassword = 'user/check-password';
export const settings = 'app/settings';

export const createForum = 'posts/create';
export const getForum = 'forum/posts';
export const deleteForum = 'forum/post';

export const transferGroupOwnership = 'groups/ownership/transfer';
export const cancelGroupOwnership = 'groups/ownership/cancel-transfer';
export const acceptGroupOwnership = 'groups/ownership/accept-transfer';
