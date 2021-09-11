export default class QueryBuilder {
  static insertNewUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) {
    return `INSERT INTO USERS(EMAIL, FIRST_NAME, LAST_NAME, PASSWORD)
            VALUES ('${email}', '${firstName}', '${lastName}', '${password}')`;
  }

  static findUserByEmail(email: string) {
    return `SELECT ID, EMAIL, FIRST_NAME, LAST_NAME, PASSWORD
            FROM USERS USR
            WHERE USR.EMAIL = '${email}'`;
  }
}
