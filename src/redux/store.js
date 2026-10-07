import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {persistReducer, persistStore} from 'redux-persist';
import signUpReducer from './slices/signUpSlice';
import loginReducer from './slices/loginSlice';
import otpReducer from './slices/OtpVerifySlice';
import googleLoginReducer from './slices/googleLoginSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userInfoReducer from './slices/userInfoSlice';
import CreateGroupReducer from './slices/CreateGroupSlice';
import GroupCodeReducer from './slices/GroupCodeAvailabilityCheckSlice';
import MyGroupsReducer from './slices/MyGroupsSlice';
import GroupDetailReducer from './slices/GroupDetailsSlice';
import SearchGroupReducer from './slices/SearchPublicGroupSlice';
import SearchPrivateGroupReducer from './slices/SearchPrivateGroupSlice';
import JoinGroupReducer from './slices/JoinGroupSlice';
import CreateEventReducer from './slices/CreateEventSlice';
import EditGroupReducer from './slices/EditGroupSlice';
import JoinPrivateGroupReducer from './slices/JoinPrivateGroupSlice';
import GroupJoiningRequestsReducer from './slices/GroupJoiningRequestsSlice';
import GroupRequestsApprovalReducer from './slices/GroupRequestApprovalSlice';
import GroupRequestsRejectionReducer from './slices/DeclineMembershipSlice';
import AllMembersReducer from './slices/AllmembersSlice';
import LeaveGroupReducer from './slices/LeaveGroupSlice';
import DeleteGroupReducer from './slices/DeleteGroupSlice';
import MyEventsReducer from './slices/MyEventsSlice';
import EventDetailsReducer from './slices/EventDetailsSlice';
import UpcomingEventsReducer from './slices/UpcomingEventsSlice';
import WithdrawEventReducer from './slices/WithdrawEventSlice';
import JoinEventReducer from './slices/JoinEventSlice';
import DeleteEventReducer from './slices/DeleteEventSlice';
import UpdateProfileReducer from './slices/UpdateProfileSlice';
import ChangePasswordReducer from './slices/ChangePasswordSlice';
import PaymentsMethodSlice from './slices/PaymentsMethodSlice';
import NotificationsReducer from './slices/NotificationSlice';
import DeleteUserReducer from './slices/DeleteUserSlice';
import EventMembersReducer from './slices/EventMembersSlice';
import ForgotPasswordReducer from './slices/ForgotPasswordSlice';
import ResetPasswordReducer from './slices/ResetPasswordSlice';
import userProfileReducer from './slices/UserProfileSlice';
import ReadNotificationsReducer from './slices/NotificationsReadSlice';
import CheckPasswordReducer from './slices/CheckPasswordSlice';
import HostSelectionSlice from './slices/HostSelectionSlice';
import resendOtpReducer from './slices/ResendOtpSlice';
import SiteCommissionReducer from './slices/SiteComissionSlice';
import CreateForumReducer from './slices/ForumCreateSlice';
import GetForumReducer from './slices/ForumGetSlice';
import DeleteForumReducer from './slices/ForumDeleteSlice';

const rootReducer = combineReducers({
  signUp: signUpReducer,
  login: loginReducer,
  otp: otpReducer,
  resendOtp: resendOtpReducer,
  google: googleLoginReducer,
  userInfo: userInfoReducer,
  creategroup: CreateGroupReducer,
  groupcode: GroupCodeReducer,
  manageGroups: MyGroupsReducer,
  groupDetail: GroupDetailReducer,
  searchgroup: SearchGroupReducer,
  searchprivategroup: SearchPrivateGroupReducer,
  joingroup: JoinGroupReducer,
  joinprivate: JoinPrivateGroupReducer,
  editgroup: EditGroupReducer,
  groupJoiningRequests: GroupJoiningRequestsReducer,
  groupRequestsApprove: GroupRequestsApprovalReducer,
  groupRequestsReject: GroupRequestsRejectionReducer,
  AllMembers: AllMembersReducer,
  leaveGroup: LeaveGroupReducer,
  deleteGroup: DeleteGroupReducer,
  createEvent: CreateEventReducer,
  myevents: MyEventsReducer,
  eventdetails: EventDetailsReducer,
  upcomingevents: UpcomingEventsReducer,
  withdrawevent: WithdrawEventReducer,
  joinevent: JoinEventReducer,
  deleteEvent: DeleteEventReducer,
  updateProfile: UpdateProfileReducer,
  changePassword: ChangePasswordReducer,
  paymentsMethod: PaymentsMethodSlice,
  MyNotifications: NotificationsReducer,
  ReadNotifications: ReadNotificationsReducer,
  deleteuser: DeleteUserReducer,
  eventmembers: EventMembersReducer,
  forgotPassword: ForgotPasswordReducer,
  resetPassword: ResetPasswordReducer,
  userprofile: userProfileReducer,
  checkPassword: CheckPasswordReducer,
  hostSelection: HostSelectionSlice,
  siteCommission: SiteCommissionReducer,
  createForum:CreateForumReducer,
  getForum: GetForumReducer,
deleteForum: DeleteForumReducer,
});

const persistConfig = {
  storage: AsyncStorage,
  key: 'root',
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});
const persistor = persistStore(store);
persistor.flush();
export default {store, persistor};
