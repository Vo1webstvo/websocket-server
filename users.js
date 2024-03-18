let users = [];

const findUser =  (arg) => {
  const nameUser =  arg?.user?.trim().toLowerCase();
  const roomUser =  arg?.room?.trim().toLowerCase();

   return users.find((u) => {
    return u?.user?.trim().toLowerCase() === nameUser && u?.room?.trim().toLowerCase() === roomUser;
  });
};

const addUser =  (arg) => {
  const findUserr =  findUser(arg);

  // выбираем пользователя, либо из findUserr если он уже есть, либо из arg (новый)
  const currentUser = findUserr || arg;
  if (!findUserr) {
    users.push(currentUser);
  }

   return {
    findUserr: !!findUserr,
    userInfo: currentUser,
  };
};

const getAllUserRoom =  (room) => {
  const usersThisRoom =  users.filter((user) => user?.room === room);
  return usersThisRoom;

};

const removeUser =  (user) => {
  const found = findUser(user);

  if (found) {
    users = users.filter(
        ({ room, user }) => room === found.room && user !== found.user
    );
  }

  return found;
};

const checkUserForLogin = (u) => {

}

module.exports = { addUser, getAllUserRoom, findUser, removeUser };
