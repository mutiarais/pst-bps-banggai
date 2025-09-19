import { PEGAWAI_NUMBERS } from "./const.js";

/**
 * Checks if a given pegawaiPhoneNumber is present in any session.
 *
 * @param {Object} session - The session object containing user sessions.
 * @param {string} nomorPegawai - The phone number of the staff member.
 * @returns {boolean} - True if the pegawaiPhoneNumber is found in any session, otherwise false.
 */
export function isPegawaiPhoneNumberInSession(session, nomorPegawai) {
  // Iterate through each session to check for the pegawaiPhoneNumber
  for (const key in session) {
    if (session[key].pegawaiPhoneNumber === nomorPegawai) {
      console.log(`Pegawai phone number ${nomorPegawai} found in session.`);
      return true; // Found the pegawaiPhoneNumber
    }
  }
  console.log(`Pegawai phone number ${nomorPegawai} not found in session.`);
  return false; // pegawaiPhoneNumber not found in any session
}

/**
 * Checks if a given userPhoneNumber exists in the PEGAWAI_NUMBERS array.
 *
 * @param {string} userPhoneNumber - The phone number of the staff member.
 * @returns {boolean} - True if the userPhoneNumber exists in PEGAWAI_NUMBERS, otherwise false.
 */
export function isPegawai(userPhoneNumber) {
  // Check if userPhoneNumber exists in the PEGAWAI_NUMBERS array
  const exists = PEGAWAI_NUMBERS.some((pegawai) => pegawai.number === userPhoneNumber);
  if (exists) {
    console.log(`User phone number ${userPhoneNumber} is a pegawai.`);
  } else {
    console.log(`User phone number ${userPhoneNumber} is not a pegawai.`);
  }
  return exists;
}

/**
 * Retrieves the name of the staff member given their phone number.
 *
 * @param {string} number - The phone number of the staff member.
 * @returns {string | null} - The name of the staff member if found, otherwise null.
 */
export function getStaffNameByNumber(number) {
  // Find the staff member with the given number
  const staff = PEGAWAI_NUMBERS.find((pegawai) => pegawai.number === number);

  // Return the name if found, otherwise return null
  if (staff) {
    console.log(`Staff name for phone number ${number}: ${staff.name}`);
  } else {
    console.log(`Staff name not found for phone number ${number}.`);
  }
  return staff ? staff.name : null;
}

/**
 * Retrieves the user phone number (key) from the session object by pegawaiPhoneNumber.
 *
 * @param {Object} session - The session object containing user sessions.
 * @param {string} pegawaiPhoneNumber - The phone number of the staff member.
 * @returns {string | null} - The user phone number (key) if found, otherwise null.
 */
export function getUserPhoneNumberInSession(session, pegawaiPhoneNumber) {
  // Iterate over the keys in the session object
  for (const userPhoneNumber in session) {
    // Check if the pegawaiPhoneNumber matches
    if (session[userPhoneNumber].pegawaiPhoneNumber === pegawaiPhoneNumber) {
      console.log(`User phone number for pegawai phone number ${pegawaiPhoneNumber}: ${userPhoneNumber}`);
      return userPhoneNumber;
    }
  }
  console.log(`User phone number not found for pegawai phone number ${pegawaiPhoneNumber}.`);
  return null; // Return null if no match is found
}
