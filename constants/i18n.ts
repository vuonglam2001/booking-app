export type Strings = {
  onboarding: {
    title: string;
    subtitle: string;
    dining: string;
    diningDesc: string;
    nightlife: string;
    nightlifeDesc: string;
  };
  home: {
    greeting: string;
    searchPlaceholder: string;
    searchPlaceholderNightlife: string;
    trending: string;
    trendingNightlife: string;
    nearYou: string;
    topRated: string;
    seeAll: string;
    findRestaurants: string;
    findVenues: string;
    allDistricts: string;
  };
  search: {
    title: string;
    placeholder: string;
    noResults: string;
    noResultsDesc: string;
  };
  venue: {
    about: string;
    hours: string;
    photos: string;
    reviews: string;
    readMore: string;
    showLess: string;
    bookNow: string;
  };
  booking: {
    title: string;
    selectDate: string;
    selectTime: string;
    guests: string;
    specialRequests: string;
    specialRequestsPlaceholder: string;
    confirm: string;
    unavailable: string;
  };
  confirmation: {
    title: string;
    subtitle: string;
    reservationId: string;
    venue: string;
    date: string;
    time: string;
    guests: string;
    viewBookings: string;
    backHome: string;
  };
  bookings: {
    title: string;
    upcoming: string;
    past: string;
    empty: string;
    emptyDesc: string;
    cancel: string;
  };
  profile: {
    title: string;
    signIn: string;
    signInPrompt: string;
    signOut: string;
    appMode: string;
    notifications: string;
    language: string;
    about: string;
    savedVenues: string;
    accountSettings: string;
    bookings: string;
    favorites: string;
    reviews: string;
  };
  auth: {
    title: string;
    emailPlaceholder: string;
    sendCode: string;
    otpTitle: string;
    otpSubtitle: string;
    verify: string;
    sentTo: string;
  };
  filters: {
    title: string;
    cuisine: string;
    music: string;
    price: string;
    pricePerPerson: string;
    rating: string;
    all: string;
    numberOfGuests: string;
    kidFriendly: string;
    arrivalTime: string;
    area: string;
    city: string;
    district: string;
    allDistricts: string;
    allAreas: string;
    clearAll: string;
    viewResults: string;
    min: string;
    max: string;
    showMore: string;
    peakHours: string;
    allTimes: string;
  };
  bookingDetail: {
    title: string;
    status: string;
    date: string;
    time: string;
    guests: string;
    specialRequests: string;
    cancelBooking: string;
    cancelReasonTitle: string;
    cancelReasonSubtitle: string;
    cancelReasons: {
      changeOfPlans: string;
      foundBetterOption: string;
      schedulingConflict: string;
      tooExpensive: string;
      weatherConditions: string;
      other: string;
    };
    confirmCancel: string;
    reviewTitle: string;
    reviewPlaceholder: string;
    submitReview: string;
    reviewSubmitted: string;
    reviewThankYou: string;
    yourRating: string;
    yourReview: string;
    ongoing: string;
    upcoming: string;
    completed: string;
    cancelled: string;
  };
  notifications: {
    title: string;
    empty: string;
    emptyDesc: string;
    markAllRead: string;
  };
  common: {
    guest: string;
    guests: string;
    today: string;
    tomorrow: string;
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    confirm: string;
    done: string;
    save: string;
    at: string;
  };
};

export type Language = 'en' | 'vi';

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

const en: Strings = {
  onboarding: {
    title: 'Welcome to Spotly',
    subtitle: 'Find your perfect spot',
    dining: 'Dining',
    diningDesc: 'Discover the best restaurants in town',
    nightlife: 'Nightlife',
    nightlifeDesc: 'Explore bars, clubs & lounges',
  },
  home: {
    greeting: 'Find your spot',
    searchPlaceholder: 'Find a restaurant nearby...',
    searchPlaceholderNightlife: 'Find a place for tonight...',
    trending: 'Trending Now',
    trendingNightlife: 'Trending Tonight',
    nearYou: 'Near You',
    topRated: 'Top Rated',
    seeAll: 'See all',
    findRestaurants: 'Find restaurants',
    findVenues: 'Find venues',
    allDistricts: 'All Districts',
  },
  search: {
    title: 'Search',
    placeholder: 'Search venues...',
    noResults: 'No venues found',
    noResultsDesc: 'Try adjusting your search or filters',
  },
  venue: {
    about: 'About',
    hours: 'Hours',
    photos: 'Photos',
    reviews: 'Reviews',
    readMore: 'Read more',
    showLess: 'Show less',
    bookNow: 'Book Now',
  },
  booking: {
    title: 'Book a Table',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    guests: 'Number of Guests',
    specialRequests: 'Special Requests',
    specialRequestsPlaceholder: 'Any dietary requirements or preferences...',
    confirm: 'Confirm Booking',
    unavailable: 'Unavailable',
  },
  confirmation: {
    title: 'Booking Confirmed!',
    subtitle: 'Your reservation has been confirmed',
    reservationId: 'Reservation ID',
    venue: 'Venue',
    date: 'Date',
    time: 'Time',
    guests: 'Guests',
    viewBookings: 'View My Bookings',
    backHome: 'Back to Home',
  },
  bookings: {
    title: 'My Bookings',
    upcoming: 'Upcoming',
    past: 'Past',
    empty: 'No bookings yet',
    emptyDesc: 'Your reservations will appear here',
    cancel: 'Cancel Booking',
  },
  profile: {
    title: 'Profile',
    signIn: 'Sign In',
    signInPrompt: 'Sign in to manage your bookings',
    signOut: 'Sign Out',
    appMode: 'App Mode',
    notifications: 'Notifications',
    language: 'Language',
    about: 'About Spotly',
    savedVenues: 'Saved Venues',
    accountSettings: 'Account Settings',
    bookings: 'Bookings',
    favorites: 'Favorites',
    reviews: 'Reviews',
  },
  auth: {
    title: 'Sign in to continue',
    emailPlaceholder: 'Enter your email',
    sendCode: 'Send Code',
    otpTitle: 'Enter verification code',
    otpSubtitle: 'We sent a code to your email',
    verify: 'Verify',
    sentTo: 'Sent to',
  },
  filters: {
    title: 'Filters',
    cuisine: 'Cuisine',
    music: 'Music',
    price: 'Price Range',
    pricePerPerson: 'Cost per person (VND)',
    rating: 'Rating',
    all: 'All',
    numberOfGuests: 'Number of guests?',
    kidFriendly: 'Kid-friendly restaurants',
    arrivalTime: 'Arrival time?',
    area: 'Area?',
    city: 'City',
    district: 'District',
    allDistricts: 'All Districts',
    allAreas: 'All areas',
    clearAll: 'Clear all',
    viewResults: 'View results',
    min: 'Min',
    max: 'Max',
    showMore: 'Show more',
    peakHours: 'Peak Hours',
    allTimes: 'All Times',
  },
  bookingDetail: {
    title: 'Booking Details',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    guests: 'Guests',
    specialRequests: 'Special Requests',
    cancelBooking: 'Cancel Booking',
    cancelReasonTitle: 'Cancel Booking',
    cancelReasonSubtitle: 'Please select a reason for cancellation',
    cancelReasons: {
      changeOfPlans: 'Change of plans',
      foundBetterOption: 'Found a better option',
      schedulingConflict: 'Scheduling conflict',
      tooExpensive: 'Too expensive',
      weatherConditions: 'Weather conditions',
      other: 'Other',
    },
    confirmCancel: 'Confirm Cancellation',
    reviewTitle: 'Leave a Review',
    reviewPlaceholder: 'How was your experience?',
    submitReview: 'Submit Review',
    reviewSubmitted: 'Review Submitted!',
    reviewThankYou: 'Thank you for your feedback',
    yourRating: 'Your Rating',
    yourReview: 'Your Review',
    ongoing: 'Ongoing',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
  },
  notifications: {
    title: 'Notifications',
    empty: 'No notifications',
    emptyDesc: "You're all caught up!",
    markAllRead: 'Mark all as read',
  },
  common: {
    guest: 'guest',
    guests: 'guests',
    today: 'Today',
    tomorrow: 'Tomorrow',
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    done: 'Done',
    save: 'Save',
    at: 'at',
  },
};

const vi: Strings = {
  onboarding: {
    title: 'Chào mừng đến Spotly',
    subtitle: 'Tìm địa điểm hoàn hảo của bạn',
    dining: 'Ẩm thực',
    diningDesc: 'Khám phá những nhà hàng tốt nhất',
    nightlife: 'Giải trí đêm',
    nightlifeDesc: 'Khám phá quán bar, club & lounge',
  },
  home: {
    greeting: 'Tìm địa điểm của bạn',
    searchPlaceholder: 'Tìm nhà hàng gần bạn...',
    searchPlaceholderNightlife: 'Tìm địa điểm tối nay...',
    trending: 'Đang thịnh hành',
    trendingNightlife: 'Thịnh hành tối nay',
    nearYou: 'Gần bạn',
    topRated: 'Đánh giá cao',
    seeAll: 'Xem tất cả',
    findRestaurants: 'Tìm nhà hàng',
    findVenues: 'Tìm địa điểm',
    allDistricts: 'Tất cả quận',
  },
  search: {
    title: 'Tìm kiếm',
    placeholder: 'Tìm địa điểm...',
    noResults: 'Không tìm thấy địa điểm',
    noResultsDesc: 'Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc',
  },
  venue: {
    about: 'Giới thiệu',
    hours: 'Giờ mở cửa',
    photos: 'Hình ảnh',
    reviews: 'Đánh giá',
    readMore: 'Xem thêm',
    showLess: 'Thu gọn',
    bookNow: 'Đặt ngay',
  },
  booking: {
    title: 'Đặt bàn',
    selectDate: 'Chọn ngày',
    selectTime: 'Chọn giờ',
    guests: 'Số khách',
    specialRequests: 'Yêu cầu đặc biệt',
    specialRequestsPlaceholder: 'Yêu cầu về chế độ ăn hoặc sở thích...',
    confirm: 'Xác nhận đặt chỗ',
    unavailable: 'Không khả dụng',
  },
  confirmation: {
    title: 'Đặt chỗ thành công!',
    subtitle: 'Đặt chỗ của bạn đã được xác nhận',
    reservationId: 'Mã đặt chỗ',
    venue: 'Địa điểm',
    date: 'Ngày',
    time: 'Giờ',
    guests: 'Số khách',
    viewBookings: 'Xem đặt chỗ của tôi',
    backHome: 'Về trang chủ',
  },
  bookings: {
    title: 'Đặt chỗ của tôi',
    upcoming: 'Sắp tới',
    past: 'Đã qua',
    empty: 'Chưa có đặt chỗ nào',
    emptyDesc: 'Đặt chỗ của bạn sẽ xuất hiện ở đây',
    cancel: 'Hủy đặt chỗ',
  },
  profile: {
    title: 'Hồ sơ',
    signIn: 'Đăng nhập',
    signInPrompt: 'Đăng nhập để quản lý đặt chỗ',
    signOut: 'Đăng xuất',
    appMode: 'Chế độ ứng dụng',
    notifications: 'Thông báo',
    language: 'Ngôn ngữ',
    about: 'Về Spotly',
    savedVenues: 'Địa điểm đã lưu',
    accountSettings: 'Cài đặt tài khoản',
    bookings: 'Đặt chỗ',
    favorites: 'Yêu thích',
    reviews: 'Đánh giá',
  },
  auth: {
    title: 'Đăng nhập để tiếp tục',
    emailPlaceholder: 'Nhập email của bạn',
    sendCode: 'Gửi mã',
    otpTitle: 'Nhập mã xác thực',
    otpSubtitle: 'Chúng tôi đã gửi mã đến email của bạn',
    verify: 'Xác thực',
    sentTo: 'Đã gửi đến',
  },
  filters: {
    title: 'Bộ lọc',
    cuisine: 'Ẩm thực',
    music: 'Âm nhạc',
    price: 'Khoảng giá',
    pricePerPerson: 'Chi phí mỗi người (VND)',
    rating: 'Đánh giá',
    all: 'Tất cả',
    numberOfGuests: 'Số lượng khách?',
    kidFriendly: 'Nhà hàng thân thiện trẻ em',
    arrivalTime: 'Giờ đến?',
    area: 'Khu vực?',
    city: 'Thành phố',
    district: 'Quận',
    allDistricts: 'Tất cả quận',
    allAreas: 'Tất cả khu vực',
    clearAll: 'Xóa tất cả',
    viewResults: 'Xem kết quả',
    min: 'Tối thiểu',
    max: 'Tối đa',
    showMore: 'Xem thêm',
    peakHours: 'Giờ cao điểm',
    allTimes: 'Tất cả giờ',
  },
  bookingDetail: {
    title: 'Chi tiết đặt chỗ',
    status: 'Trạng thái',
    date: 'Ngày',
    time: 'Giờ',
    guests: 'Số khách',
    specialRequests: 'Yêu cầu đặc biệt',
    cancelBooking: 'Hủy đặt chỗ',
    cancelReasonTitle: 'Hủy đặt chỗ',
    cancelReasonSubtitle: 'Vui lòng chọn lý do hủy',
    cancelReasons: {
      changeOfPlans: 'Thay đổi kế hoạch',
      foundBetterOption: 'Tìm được lựa chọn tốt hơn',
      schedulingConflict: 'Trùng lịch',
      tooExpensive: 'Quá đắt',
      weatherConditions: 'Điều kiện thời tiết',
      other: 'Lý do khác',
    },
    confirmCancel: 'Xác nhận hủy',
    reviewTitle: 'Viết đánh giá',
    reviewPlaceholder: 'Trải nghiệm của bạn thế nào?',
    submitReview: 'Gửi đánh giá',
    reviewSubmitted: 'Đã gửi đánh giá!',
    reviewThankYou: 'Cảm ơn phản hồi của bạn',
    yourRating: 'Đánh giá của bạn',
    yourReview: 'Nhận xét của bạn',
    ongoing: 'Đang diễn ra',
    upcoming: 'Sắp tới',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  },
  notifications: {
    title: 'Thông báo',
    empty: 'Không có thông báo',
    emptyDesc: 'Bạn đã cập nhật hết rồi!',
    markAllRead: 'Đánh dấu tất cả đã đọc',
  },
  common: {
    guest: 'khách',
    guests: 'khách',
    today: 'Hôm nay',
    tomorrow: 'Ngày mai',
    loading: 'Đang tải...',
    error: 'Đã xảy ra lỗi',
    retry: 'Thử lại',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    done: 'Xong',
    save: 'Lưu',
    at: 'lúc',
  },
};

export const translations: Record<Language, Strings> = { en, vi };
