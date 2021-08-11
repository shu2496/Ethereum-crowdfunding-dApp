pragma solidity ^0.4.17;

contract CampaignFactory{
    address[] public deployedCampaigns;
    
    function createCampaign(uint minimum) public{
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }
    
    function getDeployedCampaigns() public view returns (address[]){
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        mapping(address=>bool) approvals;
        uint approvalCount;
    }
    
    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;
    
    modifier restricted(){
        require(msg.sender == manager);
        _;
    }

    function Campaign(uint minimum, address creator) public{
        manager = creator;
        minimumContribution = minimum;
    }
    
    function contribute() public payable{
        require(msg.value > minimumContribution);
        
        approvers[msg.sender] = true;
        approversCount++;
    }
    
    
    function createRequest(string description, uint value, address recipient) public restricted {
        Request memory newRequest = Request({
            description: description,
            value:value,
            recipient: recipient,
            complete: false,
            approvalCount:0
        });
        
        requests.push(newRequest);
    }
    
    function approveRequest(uint index) public{
        Request storage request = requests[index];
        
        //check that approver is a contributor
        require(approvers[msg.sender]); 
        
        // check that approver has not approved already
        require(!request.approvals[msg.sender]); 
        
        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }
    
    function finalizeRequest(uint index) public restricted{
        Request storage request = requests[index];
        
        //check that request is not already complete
        require(!request.complete);
        
        //check that approvals are at least more than 50%
        require(request.approvalCount > (approversCount/2));
        
        //transfer the money to the vendor/recipient
        request.recipient.transfer(request.value);
        
        request.complete = true;
    }  

    function getSummary() public view returns (
        uint, uint,uint,uint, address
    ){
        return (
            minimumContribution,
            this.balance,
            requests.length,
            approversCount,
            manager
        );
    } 

    function getRequestsCount() public view returns (uint){
        return requests.length;
    }
}