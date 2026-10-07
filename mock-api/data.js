// Fake data served by the mock API. All people, groups and events are fictional.
// Dates are generated relative to "today" so upcoming events always look upcoming.

const pad = n => String(n).padStart(2, '0');

const dayOffset = days => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
};

const ymd = d =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const iso = (days, hour = 9) => {
  const d = dayOffset(days);
  d.setHours(hour);
  return d.toISOString();
};

const avatar = (name, color) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=${color}&color=fff&size=256&format=png&bold=true`;

const ME_ID = 1;

const people = [
  {id: 1, first_name: 'Alex', last_name: 'Morgan', color: '2CA7D5'},
  {id: 2, first_name: 'Priya', last_name: 'Shah', color: 'FD397F'},
  {id: 3, first_name: 'Daniel', last_name: 'Okafor', color: '099D63'},
  {id: 4, first_name: 'Sofia', last_name: 'Rossi', color: 'F5A623'},
  {id: 5, first_name: 'Liam', last_name: 'Chen', color: '7B61FF'},
  {id: 6, first_name: 'Emma', last_name: 'Becker', color: 'E5533D'},
  {id: 7, first_name: 'Noah', last_name: 'Williams', color: '1F7A8C'},
  {id: 8, first_name: 'Hana', last_name: 'Kim', color: 'B5838D'},
].map(p => ({
  ...p,
  title: `${p.first_name} ${p.last_name}`,
  email: `${p.first_name.toLowerCase()}@example.com`,
  phone: `555010${p.id}`,
  zip_code: '94107',
  photo_url_main: avatar(`${p.first_name} ${p.last_name}`, p.color),
}));

const person = id => people.find(p => p.id === id);

const groupSeeds = [
  {
    id: 101,
    title: 'Weekend Hikers',
    image: 'hike.png',
    owner_id: ME_ID,
    privacy: 'public',
    code: 'HIKE24',
    members_count: 48,
    description:
      'Easy-to-moderate trail hikes every weekend around the bay. All paces welcome, carpools organised in the Message Board.',
  },
  {
    id: 102,
    title: 'Sunday Soccer League',
    image: 'soccer.png',
    owner_id: 3,
    privacy: 'public',
    code: 'GOAL11',
    members_count: 32,
    description:
      'Friendly 7-a-side games every Sunday morning. Bring both a light and a dark shirt!',
  },
  {
    id: 103,
    title: 'Downtown Book Club',
    image: 'book.png',
    owner_id: 2,
    privacy: 'private',
    code: 'READ42',
    members_count: 15,
    description:
      'One book a month, one great conversation. We meet at the corner cafe on the last Thursday.',
  },
  {
    id: 104,
    title: 'Board Game Night',
    image: 'dice.png',
    owner_id: 4,
    privacy: 'public',
    code: 'DICE07',
    members_count: 21,
    description:
      'Strategy, party and co-op games. Snacks provided, competitive spirit optional.',
  },
  {
    id: 105,
    title: 'Photography Walks',
    image: 'camera.png',
    owner_id: 5,
    privacy: 'public',
    code: 'SNAP35',
    members_count: 27,
    description:
      'Golden-hour photo walks through the city. Phones and cameras equally welcome.',
  },
  {
    id: 106,
    title: 'Lakeside Runners',
    image: 'run.png',
    owner_id: 6,
    privacy: 'public',
    code: 'RUN5K',
    members_count: 39,
    description:
      'Tuesday and Thursday 5K loops around the lake, 6:30 pm sharp.',
  },
];

const myGroupIds = [101, 102, 103, 104];

const eventSeeds = [
  {
    id: 201,
    group: 101,
    title: 'Sunrise Hike at Mount Tam',
    days: 3,
    start: '06:30:00',
    end: '10:30:00',
    location: 'Pantoll Ranger Station, Mill Valley',
    fee: 0,
    image: 'sunrise.png',
    hosts: [1, 3],
    attendees: [1, 3, 2, 5, 7],
    description:
      'Catch the sunrise from the summit! Around 6 miles with 1,500 ft of elevation gain. Bring water, layers and a headlamp.',
    notes: 'Carpool meets at 5:45 am at the Safeway parking lot.',
  },
  {
    id: 202,
    group: 102,
    title: 'Sunday 7-a-side Match',
    days: 5,
    start: '09:00:00',
    end: '11:00:00',
    location: 'Golden Gate Park, Field 3',
    fee: 8,
    image: 'soccer.png',
    hosts: [3],
    attendees: [3, 1, 4, 6, 8, 5],
    description:
      'Our weekly friendly match. The fee covers the field booking and post-game drinks.',
  },
  {
    id: 203,
    group: 103,
    title: 'Book Club: "The Midnight Library"',
    days: 9,
    start: '19:00:00',
    end: '21:00:00',
    location: 'Corner Cafe, 2nd Floor',
    fee: 0,
    image: 'book.png',
    hosts: [2],
    attendees: [2, 1, 8],
    description:
      'This month we discuss "The Midnight Library" by Matt Haig. Coffee and pastries on the house.',
  },
  {
    id: 204,
    group: 104,
    title: 'Catan Tournament',
    days: 12,
    start: '18:30:00',
    end: '22:30:00',
    location: 'The Dice Tower Game Cafe',
    fee: 12,
    image: 'dice.png',
    hosts: [4, 1],
    attendees: [4, 1, 5, 6],
    description:
      'Four rounds of Catan with a small prize for the champion. Beginners are paired with a coach.',
  },
  {
    id: 205,
    group: 101,
    title: 'Lands End Coastal Trail',
    days: 17,
    start: '08:00:00',
    end: '11:00:00',
    location: 'Lands End Lookout',
    fee: 0,
    image: 'coast.png',
    hosts: [1],
    attendees: [1, 2, 7],
    description:
      'A relaxed coastal walk with views of the Golden Gate Bridge, followed by brunch.',
  },
  {
    id: 206,
    group: 105,
    title: 'Golden Hour Photo Walk',
    days: 6,
    start: '17:30:00',
    end: '19:30:00',
    location: 'Embarcadero, Pier 7',
    fee: 0,
    image: 'camera.png',
    hosts: [5],
    attendees: [5, 1, 8],
    description:
      'Practice composition and light along the waterfront at sunset.',
  },
  {
    id: 207,
    group: 101,
    title: 'Muir Woods Loop',
    days: -10,
    start: '09:00:00',
    end: '12:00:00',
    location: 'Muir Woods National Monument',
    fee: 0,
    image: 'hike.png',
    hosts: [1],
    attendees: [1, 2, 3, 4],
    description: 'A shaded loop through the redwoods.',
  },
];

const notificationSeeds = [
  {
    id: 301,
    type: 'joinGroup_request',
    object_type: 'group',
    group: 101,
    subject_id: 8,
    body_content: '<a href="#">Hana Kim</a> asked to join',
  },
  {
    id: 302,
    type: 'event_created',
    object_type: 'event',
    event: 203,
    body_content: 'Priya Shah created a new event:',
  },
  {
    id: 303,
    type: 'event_joined',
    object_type: 'event',
    event: 201,
    body_content: 'Daniel Okafor is attending',
  },
  {
    id: 304,
    type: 'forum_mention',
    object_type: 'group',
    group: 102,
    body_content: 'Daniel Okafor mentioned you in',
  },
  {
    id: 305,
    type: 'event_reminder',
    object_type: 'event',
    event: 202,
    body_content: 'Coming up in 5 days:',
  },
];

const forumSeeds = [
  {
    id: 401,
    author: 3,
    hoursAgo: 50,
    body: 'Who is driving to the sunrise hike on Saturday? I have 3 free seats from the Mission.',
    replies: [
      {
        id: 4011,
        author: 2,
        hoursAgo: 49,
        body: "I'd love a seat, thanks Daniel!",
      },
      {id: 4012, author: 7, hoursAgo: 48, body: 'Count me in too 🙌'},
    ],
  },
  {
    id: 402,
    author: 1,
    hoursAgo: 30,
    body: 'Reminder: headlamps are a must for the first 30 minutes. The trail is pitch dark before sunrise.',
    attachments: ['sunrise.png'],
  },
  {
    id: 403,
    author: 5,
    hoursAgo: 20,
    body: 'Here are a few shots from last weekend at Muir Woods 🌲',
    attachments: ['coast.png', 'hike.png'],
  },
  {
    id: 404,
    author: 2,
    hoursAgo: 4,
    body: 'Is anyone up for brunch after the Lands End walk?',
    replies: [
      {
        id: 4041,
        author: 1,
        hoursAgo: 3,
        body: 'Absolutely, I will book a table for 8.',
      },
    ],
  },
  {
    id: 405,
    author: 8,
    hoursAgo: 1,
    body: 'Just joined the group, excited to meet everyone on Saturday! 👋',
  },
];

module.exports = {
  ME_ID,
  people,
  person,
  groupSeeds,
  myGroupIds,
  eventSeeds,
  notificationSeeds,
  forumSeeds,
  dayOffset,
  ymd,
  iso,
};
