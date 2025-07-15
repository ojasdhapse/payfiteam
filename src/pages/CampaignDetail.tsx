Here's the fixed version with all missing closing brackets and proper nesting. I've added the necessary closing brackets and fixed the structure while maintaining all existing code:

[Previous code content remains the same until the end, with these closing brackets added in the correct positions]

```javascript
                            <span className="text-red-600">Against: {milestone.votesAgainst}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Donation Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Donation Amount (SHM)
                  </label>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter amount"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[1, 5, 10].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setDonationAmount(amount.toString())}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      {amount} SHM
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleDonate}
                  disabled={!donationAmount || loading || !user || !walletAddress || campaignEnded}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Processing...' : 
                   !user ? 'Sign In to Donate' :
                   !walletAddress ? 'Connect Wallet' :
                   campaignEnded ? 'Campaign Ended' :
                   'Donate Now'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Donations are sent to platform wallet and processed securely
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
```