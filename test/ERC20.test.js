const { ethers } = require('hardhat');
const { expect } = require('chai');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { PANIC_CODES } = require('@nomicfoundation/hardhat-chai-matchers/panic');

const {
  shouldBehaveLikeERC20,
  shouldBehaveLikeERC20Transfer,
  shouldBehaveLikeERC20Approve,
} = require('./ERC20.behavior');

const TOKENS = [{ Token: 'Token' }];

const name = 'My Token';
const symbol = 'MTKN';
const initialSupply = 100n;

describe('ERC20', function () {
  for (const { Token, forcedApproval } of TOKENS) {
    describe(Token, function () {
      let holder, recipient, testAccount1;
      const fixture = async () => {
        // this.accounts is used by shouldBehaveLikeERC20
        const accounts = await ethers.getSigners();
        [holder, recipient, testAccount1] = accounts;

        const token = await ethers.deployContract(Token, [name, symbol, initialSupply, holder.address]);
        await token.connect(holder).setLiquidityDeployed(true);
        
        return { accounts, holder, recipient, token };
      };

      beforeEach(async function () {
        Object.assign(this, await loadFixture(fixture));
      });

      shouldBehaveLikeERC20(initialSupply, { forcedApproval });

      it('has a name', async function () {
        expect(await this.token.name()).to.equal(name);
      });

      it('has a symbol', async function () {
        expect(await this.token.symbol()).to.equal(symbol);
      });

      it('has 18 decimals', async function () {
        expect(await this.token.decimals()).to.equal(18n);
      });


      describe('renounceOwnership()', function () {

        it('new owner is AddressZero', async function () {
          await this.token.connect(holder).renounceOwnership();
          expect(await this.token.owner()).to.equal(ethers.ZeroAddress);
        });
  
      });

      // describe('setFinalBuyer()', function () {
      //   beforeEach(async function () {
      //     await this.token.connect(holder).setFinalBuyer(testAccount1.address);

      //     this.transfer = (from, to, value) => this.token.connect(testAccount1).transfer(to, value);

      //   });
      //   shouldBehaveLikeERC20Transfer(initialSupply);
      // });

      
    });
  }
});