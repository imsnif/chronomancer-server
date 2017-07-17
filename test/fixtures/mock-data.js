'use strict'
const now = new Date()

module.exports = {
  timelines: [
    {name: 'Timeline 1', type: 'steal', players: [1, 2, 3, 4], isLocked: false, gameId: 1},
    {name: 'Timeline 2', type: 'assist', players: [2, 3], isLocked: false, gameId: 1},
    {name: 'Timeline 3', type: 'prevent', players: [2, 3, 4], isLocked: false, gameId: 1},
    {name: 'Timeline 4', type: 'reset', isLocked: false, players: []},
    {name: 'Timeline 5', type: 'assist', players: [1, 2, 3, 5], isLocked: true, gameId: 1},
    {name: 'Timeline 6', type: 'prevent', players: [1, 2, 3, 5], isLocked: false, gameId: 1},
    {name: 'Timeline 7', type: 'reset', players: [1, 2, 3, 5], isLocked: false, gameId: 1},
    {name: 'Timeline 8', type: 'steal', players: [6, 7, 8, 9], isLocked: false, gameId: 1}
  ],
  players: [
    {
      id: 1,
      gameId: 1,
      name: 'No-Items Susan',
      items: [],
      actions: 10
    },
    {
      id: 2,
      gameId: 1,
      name: 'One-Item Siobahn',
      items: [
        {name: 'assist', source: 'Timeline 2'}
      ],
      actions: 10
    },
    {
      id: 3,
      gameId: 1,
      name: 'Gondollieri',
      items: [
        {name: 'assist', source: 'Timeline 2'},
        {name: 'prevent', source: 'Timeline 3'},
        {name: 'reset', source: 'Timeline 3'},
        {name: 'steal', source: 'Timeline 1'},
        {name: 'lock', source: 'Timeline 3'},
        {name: 'unlock', source: 'Timeline 1'}
      ],
      actions: 10
    },
    {
      id: 4,
      gameId: 1,
      name: 'Simmons',
      items: [
        {name: 'assist', source: 'Timeline 2'},
        {name: 'prevent', source: false},
        {name: 'reset', source: 'Timeline 3'},
        {name: 'steal', source: 'Timeline 1'},
        {name: 'lock', source: 'Timeline 2'},
        {name: 'unlock', source: 'Timeline 2'}
      ],
      actions: 10
    },
    {
      id: 5,
      gameId: 1,
      name: 'No-Actions Bob',
      items: [
        {name: 'assist', source: 'Timeline 2'},
        {name: 'lock', source: 'Timeline 2'},
        {name: 'unlock', source: 'Timeline 2'},
        {name: 'reset', source: 'Timeline 2'},
        {name: 'steal', source: 'Timeline 2'}
      ],
      actions: 0
    },
    {
      id: 6,
      gameId: 1,
      name: 'Two-Items Ted',
      items: [
        {name: 'assist', source: 'Timeline 2'},
        {name: 'prevent', source: 'Timeline 2'}
      ],
      actions: 10
    },
    {
      id: 7,
      gameId: 1,
      name: 'Four-Items Daria',
      items: [
        {name: 'assist', source: 'Timeline 2'},
        {name: 'prevent', source: 'Timeline 2'},
        {name: 'reset', source: 'Timeline 2'},
        {name: 'steal', source: 'Timeline 2'}
      ],
      actions: 10
    },
    {
      id: 8,
      gameId: 1,
      name: 'Five-Items Fatma',
      items: [
        {name: 'assist', source: 'Timeline 2'},
        {name: 'prevent', source: 'Timeline 2'},
        {name: 'reset', source: 'Timeline 2'},
        {name: 'steal', source: 'Timeline 2'},
        {name: 'lock', source: 'Timeline 2'}
      ],
      actions: 10
    },
    {
      id: 9,
      gameId: 1,
      name: 'Six-Items Achmed',
      items: [
        {name: 'assist', source: 'Timeline 2'},
        {name: 'prevent', source: 'Timeline 2'},
        {name: 'reset', source: 'Timeline 2'},
        {name: 'steal', source: 'Timeline 2'},
        {name: 'lock', source: 'Timeline 2'},
        {name: 'unlock', source: 'Timeline 2'}
      ],
      actions: 10
    }
  ],
  powers: [
    {
      playerId: 1,
      name: 'Locking',
      timelineName: 'Timeline 6',
      gameId: 1,
      startTime: now.getTime(),
      endTime: now.getTime() + 1000,
      target: {
        type: 'timeline',
        name: 'Timeline 6'
      },
      allies: [],
      enemies: []
    },
    {
      playerId: 2,
      name: 'Resetting',
      timelineName: 'Timeline 6',
      gameId: 1,
      startTime: now.getTime(),
      endTime: now.getTime() + 1000,
      target: {
        type: 'timeline',
        name: 'Timeline 6'
      },
      allies: [{id: 3, score: 1}],
      enemies: [{id: 3, score: 1}]
    },
    {
      playerId: 3,
      name: 'Resetting',
      timelineName: 'Timeline 6',
      gameId: 1,
      startTime: now.getTime(),
      endTime: now.getTime() + 1000,
      target: {
        type: 'timeline',
        name: 'Timeline 6'
      },
      allies: [],
      enemies: []
    }
  ],
  games: [
    {id: 1}
  ]
}
