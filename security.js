// security.js

import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Validates the incoming payload's signature against the expected signature.
 * it doesnt work with another type messages (e.g audio, sticker, etc) or even emoticon
 *
 * @param {string} payload - The payload received from the request.
 * @param {string} signature - The signature received from the request headers.
 * @returns {boolean} - Returns true if the signature is valid, otherwise false.
 */
export function validateSignature(payload, signature) {
    // Convert payload to string
    const payloadString = JSON.stringify(payload);
    const expectedSignature = crypto
        .createHmac('sha256', process.env.APP_SECRET)
        .update(payloadString, 'latin-1')
        .digest('hex');
        console.log("Signature = ", signature);
        console.log("payload = ", payloadString);
        console.log("expected Sig = ", expectedSignature);
    return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
}

/**
 * Middleware to ensure that the incoming requests to our webhook are valid and signed with the correct signature.
 */
export function signatureRequired(req, res, next) {
    console.log("Header = ", req.headers);
    console.log("Body = ", req.body);
    const signature = req.headers['x-hub-signature-256']?.substring(7); // Removing 'sha256='
    const payload = req.body; // Raw body of the request for signature verification
    if (!validateSignature(payload, signature)) {
        console.error('Signature verification failed!');
        return res.status(403).json({ status: 'error', message: 'Invalid signature' });
    }
    console.error('Signature verification success!');
    next();
}