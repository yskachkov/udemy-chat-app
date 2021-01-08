const users = [];

const addUser = ({ id, username, room }) => {
  const userName = username.trim().toLowerCase();
  const userRoom = room.trim().toLowerCase();
  const isUserDataValid = userName && userRoom;

  if (!isUserDataValid) {
    return {
      error: 'Username and room are required.'
    };
  }

  const existingUser = users.find(({ username, room }) => (
    room === userRoom && username === userName
  ));

  if (existingUser) {
    return {
      error: 'Username is in use.'
    };
  }

  const user = {
    id,
    username: userName,
    room: userRoom
  };

  users.push(user);

  return { user };
};

const removeUser = id => {
  const userIndex = users.findIndex(({ id: userId }) => userId === id);

  if (userIndex === -1) {
    return;
  }

  return users.splice(userIndex, 1)[0];
};

const getUser = id => users.find(({ id: userId }) => userId === id);

const getUsersInRoom = room => {
  const userRoom = room.trim().toLowerCase();

  return users.filter(({ room }) => userRoom === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
