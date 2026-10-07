// Local mock of the Organize My Group API, for demos, screenshots and UI work
// without a backend. No dependencies: run with `npm run mock-api`.
const http = require('http');
const fs = require('fs');
const path = require('path');
const {URL} = require('url');
const data = require('./data');

const PORT = Number(process.env.PORT) || 4000;
const IMAGES_DIR = path.join(__dirname, 'images');

const {ME_ID, person, ymd, dayOffset, iso} = data;

const ok = body => ({status: 200, json: {status_code: 200, body}});
const notFound = message => ({
  status: 404,
  json: {status_code: 404, body: {message}, message},
});

const imageUrl = (base, file) => `${base}/static/${file}`;

const buildGroup = (base, seed) => {
  const isMember = data.myGroupIds.includes(seed.id);
  const owner = person(seed.owner_id);
  return {
    id: seed.id,
    title: seed.title,
    description: seed.description,
    code: seed.code,
    privacy: seed.privacy,
    photo_url_main: imageUrl(base, seed.image),
    members_count: seed.members_count,
    owner_id: seed.owner_id,
    owner_title: owner.title,
    is_owner: seed.owner_id === ME_ID,
    is_admin: seed.owner_id === ME_ID,
    is_member: isMember,
    approved: isMember ? 1 : 0,
    is_approved: isMember,
    can_create_event: isMember,
    stripe_connected: seed.owner_id === ME_ID,
    wallet: seed.owner_id === ME_ID ? '124.50' : '0',
    user_settings: {allow_notification: 1, allow_user_notification: 1},
  };
};

const buildEvent = (base, seed) => {
  const group = data.groupSeeds.find(g => g.id === seed.group);
  const fee = seed.fee.toFixed(2);
  const isOwner = seed.hosts[0] === ME_ID;
  return {
    id: seed.id,
    title: seed.title,
    description: seed.description,
    notes: seed.notes || null,
    date: ymd(dayOffset(seed.days)),
    announce_date: ymd(dayOffset(seed.days - 14)),
    start_time: seed.start,
    end_time: seed.end,
    location: seed.location,
    photo_url_main: imageUrl(base, seed.image),
    resource_id: group.id,
    resource_title: group.title,
    parent_title: group.title,
    entry_fee: seed.fee,
    total_amount: fee,
    refund_amount: seed.fee > 0 ? fee : '0.00',
    refund_policy:
      seed.fee > 0
        ? 'Full refund if you withdraw at least 48 hours before the event.'
        : null,
    registration_opens: iso(seed.days - 14, 9),
    registration_closes: iso(seed.days - 1, 21),
    charges_process: iso(seed.days - 1, 22),
    hosts: seed.hosts.map(id => {
      const p = person(id);
      return {
        id: p.id,
        title: p.title,
        photo_url_main: p.photo_url_main,
        attending: seed.attendees.includes(id) ? 1 : 0,
      };
    }),
    show_attendees: 1,
    current_attendees: seed.attendees.length,
    attendance_limit: 20,
    min_attendence: 2,
    max_attendence: 20,
    guest_allowed: 2,
    is_owner: isOwner,
    is_member: seed.attendees.includes(ME_ID),
    can_join: !seed.attendees.includes(ME_ID),
    can_edit_event: isOwner,
    can_delete_event: isOwner,
    has_started: seed.days < 0,
    is_authorized: 1,
    payment_method: seed.fee > 0 ? 'card' : null,
  };
};

const listEvents = (base, filter) =>
  data.eventSeeds
    .filter(filter)
    .sort((a, b) => a.days - b.days)
    .map(seed => buildEvent(base, seed));

const buildPost = (base, seed) => {
  const author = person(seed.author);
  const createdAt = new Date(
    Date.now() - seed.hoursAgo * 3600 * 1000,
  ).toISOString();
  return {
    id: seed.id,
    type: seed.type || 'post',
    body: seed.body,
    created_at: createdAt,
    owner_title: author.title,
    photo_url_main: author.photo_url_main,
    is_owner: seed.author === ME_ID,
    mentions: [],
    attachments: (seed.attachments || []).map((file, i) => ({
      id: seed.id * 10 + i,
      photo_url_main: imageUrl(base, file),
    })),
    replies: (seed.replies || []).map(reply => buildPost(base, reply)),
  };
};

const pagedResponse = items => ({
  response: items,
  // The app treats totalItemCount as the overall total, even on later pages.
  totalItemCount: items.total ?? items.length,
  totalPages: 1,
  currentPage: 1,
});

// Only the first page has data; the app pages until it gets an empty list.
const firstPageOnly = (query, items) => {
  const page = Number(query.get('page') || 1) > 1 ? [] : [...items];
  page.total = items.length;
  return page;
};

const routes = [
  // Auth
  [
    'POST',
    /^login$/,
    () =>
      ok({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 60 * 60 * 24 * 30,
        user: {...person(ME_ID)},
      }),
  ],
  [
    'POST',
    /^token\/refresh$/,
    () => ({
      status: 200,
      json: {access_token: 'mock-access-token', expires_in: 60 * 60 * 24 * 30},
    }),
  ],
  ['POST', /^logout$/, () => ok({message: 'Logged out'})],
  ['POST', /^user\/check-password$/, () => ok({message: 'Password verified'})],

  // App
  [
    'GET',
    /^app\/settings$/,
    () =>
      ok({
        siteAndroidVersion: '1.1.3',
        siteAndroidForceupdate: 'false',
        siteIosVersion: '1.1.3',
        siteIosForceupdate: 'false',
        siteCommission: '5',
        siteCommissionFixed: '0.30',
      }),
  ],

  // Users
  [
    'GET',
    /^user\/me$/,
    base => {
      const me = person(ME_ID);
      return ok({...me, photo_url_profile: me.photo_url_main});
    },
  ],
  [
    'GET',
    /^user\/view\/(\d+)$/,
    (base, query, [id]) => {
      const p = person(Number(id));
      return p
        ? ok({...p, photo_url_profile: p.photo_url_main})
        : notFound('User not found');
    },
  ],
  [
    'GET',
    /^user\/notifications$/,
    (base, query) =>
      ok({
        unread: 3,
        response: firstPageOnly(query, data.notificationSeeds).map(n => {
          const object =
            n.object_type === 'group'
              ? buildGroup(
                  base,
                  data.groupSeeds.find(g => g.id === n.group),
                )
              : buildEvent(
                  base,
                  data.eventSeeds.find(e => e.id === n.event),
                );
          return {
            id: n.id,
            type: n.type,
            object_type: n.object_type,
            body_content: n.body_content,
            subject_id: n.subject_id || ME_ID,
            owner_id: object.owner_id || ME_ID,
            object: {
              id: object.id,
              title: object.title,
              image_profile: object.photo_url_main,
            },
          };
        }),
      }),
  ],

  // Groups
  [
    'GET',
    /^groups\/manage$/,
    (base, query) =>
      ok(
        pagedResponse(
          firstPageOnly(
            query,
            data.groupSeeds
              .filter(g => data.myGroupIds.includes(g.id))
              .map(g => buildGroup(base, g)),
          ),
        ),
      ),
  ],
  [
    'GET',
    /^groups\/view\/(\d+)$/,
    (base, query, [id]) => {
      const seed = data.groupSeeds.find(g => g.id === Number(id));
      return seed ? ok(buildGroup(base, seed)) : notFound('Group not found');
    },
  ],
  [
    'GET',
    /^groups\/search$/,
    (base, query) => {
      const term = (query.get('search') || '').toLowerCase();
      const byCode = query.get('type') === 'code';
      const results = data.groupSeeds
        .filter(g =>
          byCode
            ? g.code.toLowerCase() === term
            : !term || g.title.toLowerCase().includes(term),
        )
        .map((g, i) => ({
          ...buildGroup(base, g),
          distance: (1.2 + i * 0.8).toFixed(1),
        }));
      return ok(pagedResponse(firstPageOnly(query, results)));
    },
  ],
  [
    'GET',
    /^groups\/members\/(\d+)$/,
    (base, query) =>
      ok(
        pagedResponse(
          firstPageOnly(
            query,
            data.people.map(p => ({
              id: p.id,
              user_id: p.id,
              title: p.title,
              first_name: p.first_name,
              last_name: p.last_name,
              photo_url_main: p.photo_url_main,
              member_type: p.id === ME_ID ? 'owner' : 'member',
              ownership_request: 0,
            })),
          ),
        ),
      ),
  ],
  [
    'GET',
    /^groups\/requests$/,
    () => {
      const p = person(8);
      return ok(
        pagedResponse([
          {
            id: p.id,
            user_id: p.id,
            title: p.title,
            photo_url_main: p.photo_url_main,
          },
        ]),
      );
    },
  ],

  // Events
  [
    'GET',
    /^events\/manage$/,
    (base, query) => {
      const past = query.get('past') === '1';
      return ok(
        pagedResponse(
          firstPageOnly(
            query,
            listEvents(
              base,
              e =>
                e.attendees.includes(ME_ID) &&
                (past ? e.days < 0 : e.days >= 0),
            ),
          ),
        ),
      );
    },
  ],
  [
    'GET',
    /^events\/upcoming$/,
    (base, query) => {
      const groupId = Number(query.get('group_id'));
      return ok(
        pagedResponse(
          firstPageOnly(
            query,
            listEvents(
              base,
              e => e.days >= 0 && (!groupId || e.group === groupId),
            ),
          ),
        ),
      );
    },
  ],
  [
    'GET',
    /^events\/view\/(\d+)$/,
    (base, query, [id]) => {
      const seed = data.eventSeeds.find(e => e.id === Number(id));
      return seed ? ok(buildEvent(base, seed)) : notFound('Event not found');
    },
  ],
  [
    'GET',
    /^events\/members\/(\d+)$/,
    (base, query, [id]) => {
      const seed = data.eventSeeds.find(e => e.id === Number(id));
      if (!seed) {
        return notFound('Event not found');
      }
      return ok(
        pagedResponse(
          seed.attendees.map((pid, i) => {
            const p = person(pid);
            return {
              id: p.id,
              title: p.title,
              photo_url_main: p.photo_url_main,
              attending: 1,
              is_owner: seed.hosts.includes(pid),
              guests:
                i === 1
                  ? [{id: 900 + pid, title: `Guest of ${p.first_name}`}]
                  : [],
            };
          }),
        ),
      );
    },
  ],
  ['GET', /^events\/templates$/, () => ok(pagedResponse([]))],

  // Payments
  [
    'GET',
    /^payment\/methods$/,
    () =>
      ok(
        pagedResponse([
          {
            id: 'pm_mock_visa',
            brand: 'visa',
            last4: '4242',
            exp_month: 8,
            exp_year: 2029,
            default: 1,
          },
          {
            id: 'pm_mock_mc',
            brand: 'mastercard',
            last4: '4444',
            exp_month: 3,
            exp_year: 2028,
            default: 0,
          },
        ]),
      ),
  ],

  // Message board
  [
    'GET',
    /^forum\/posts$/,
    (base, query) =>
      ok({
        forum: {id: 501},
        ...pagedResponse(
          firstPageOnly(
            query,
            data.forumSeeds.map(seed => buildPost(base, seed)),
          ),
        ),
      }),
  ],
  [
    'POST',
    /^forum\/(\d+)\/posts\/create$/,
    (base, query, params, body) => {
      const seed = {
        id: Date.now(),
        author: ME_ID,
        hoursAgo: 0,
        body: body?.body || '',
      };
      data.forumSeeds.push(seed);
      return ok({message: 'Post created', response: buildPost(base, seed)});
    },
  ],
];

const serveStatic = (res, relPath) => {
  const file = path.normalize(path.join(IMAGES_DIR, relPath));
  if (!file.startsWith(IMAGES_DIR) || !fs.existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  const type = file.endsWith('.png') ? 'image/png' : 'image/jpeg';
  res.writeHead(200, {'Content-Type': type, 'Cache-Control': 'max-age=3600'});
  fs.createReadStream(file).pipe(res);
};

const readBody = req =>
  new Promise(resolve => {
    let raw = '';
    req.on('data', chunk => (raw += chunk));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const base = `http://${req.headers.host}`;

  if (url.pathname.startsWith('/static/')) {
    serveStatic(res, decodeURIComponent(url.pathname.slice('/static/'.length)));
    return;
  }

  const apiPath = url.pathname.replace(/^\/api\//, '');
  const body = await readBody(req);
  let result;
  for (const [method, pattern, handler] of routes) {
    const match = req.method === method && apiPath.match(pattern);
    if (match) {
      result = handler(base, url.searchParams, match.slice(1), body);
      break;
    }
  }

  // Anything not modelled above (joins, edits, deletes...) just succeeds.
  const matched = Boolean(result);
  result = result || ok({message: 'Success (mock)', response: []});

  console.log(
    `${req.method.padEnd(6)} ${url.pathname}${url.search} -> ${result.status}${
      matched ? '' : ' (default)'
    }`,
  );
  res.writeHead(result.status, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(result.json));
});

server.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}/api/`);
});
