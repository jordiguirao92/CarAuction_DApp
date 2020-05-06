pragma solidity >=0.4.21; 
//Declaremos la versión del compilador de Solidity. 

    //Declaramos el smart contract. 
    contract Auction {
    
	    address payable internal auction_owner; //Dirección del propietario de la subasta
	    uint256 public auction_start; //Tiempo epoch del incio de la subasta.
	    uint256 public auction_end; //Tiempo epoch del final de la subasta.
	    uint256 public highestBid; //Valor en ether, de la apuesta más elevada.
	    address public highestBidder; //Dirección del usuario que ha realizado la apuesta más elevada.
	    enum auction_state {CANCELLED, STARTED} //Enum con los diferentes estados de la subasta. (CANCELLES = 0, STARTED = 1)
	    
	    struct  car { //Estructura que define las carácteristicas del coche: marca y número matricula.
		    string  Brand;
		    string  Rnumber;
	    }
	    
	    car public Mycar; //Declaramos un objeto coche.
	    address[] bidders; //Array que contiene todas la direcciones de los apostantes.
	    mapping(address => uint) public bids; //Mapping con clave la dirección del apostande y valor la cantidad de ether total que ha apostado.
	    auction_state public STATE; //Enum que representa el estado de la subasta.
	    
	    modifier an_ongoing_auction(){ //Modificador que revisa que la subasta siga abierta en el tiempo.
	        require(now <= auction_end);
	        _;
	    }
    
	    modifier only_owner(){ //Hacer el contrato "ownable" donde el propuetario del contrato tiene ciertos privilegios.
	        require(msg.sender == auction_owner);
	        _;
	    }

        event BidEvent(address indexed highestBidder, uint256 highestBid); //Mostar información cuando el evento se ha cancelado.
	    event WithdrawalEvent(address withdrawer, uint256 amount); //Informa sobre el registro de una nueva subasta.
	    event CanceledEvent(string message, uint256 time); //Informar sobre las transacciones de retiro del ether apostado por cada participante.
        event AccidentalDeposit(address sender, uint value); //Informar de un depósito accidental tras el usuo de la función fallback.
    
	    function bid() public payable returns (bool){} //Permite a los usuarios enviar sus apuestas de ether y determina la apuesta más alta.
	    function withdraw() public returns (bool){} //Permite a los participantes returar sus apuestas una vez la subasta ha finalizado.
	    function cancel_auction() external returns (bool){} //Destruye el smart contrat en la Blockchain.

	}

contract MyAuction is Auction {

    function() external payable { //Función fallback.
        if (msg.value > 0) {
            emit AccidentalDeposit(msg.sender, msg.value);
	    }
    }

    constructor (uint _biddingTime, address payable _owner, string memory _brand, string memory _Rnumber) public {
        auction_owner = _owner;
        auction_start = now;
        auction_end = auction_start + _biddingTime*1 hours;
        STATE = auction_state.STARTED;
        Mycar.Brand = _brand;
        Mycar.Rnumber = _Rnumber;
    }

    //Funciones overloading.

    function bid() public payable an_ongoing_auction returns (bool){
	        require(bids[msg.sender] + msg.value > highestBid, "You can't bid, Make a higher Bid");
	        highestBidder = msg.sender;
	        highestBid = msg.value;
	        bidders.push(msg.sender);
	        bids[msg.sender] =  bids[msg.sender] + msg.value;
	        emit BidEvent(highestBidder,  highestBid);

	        return true;
    }


    function cancel_auction() external only_owner  an_ongoing_auction returns (bool){
	        STATE = auction_state.CANCELLED;
	        emit CanceledEvent("Auction Cancelled", now);
	        return true;
     }


    function destruct_auction() external only_owner returns (bool){
		    require(now > auction_end, "You can't destruct the contract,The auction is still open");
		     for(uint i = 0; i < bidders.length; i++)
		    {
		        assert(bids[bidders[i]]==0);
		    }

		    selfdestruct(auction_owner);
		    return true;
    }

    function withdraw() public returns (bool){
	        require(now > auction_end ,"You can't withdraw,the auction is still open");
	        uint amount;
	        amount = bids[msg.sender];
	        bids[msg.sender] = 0;
	        msg.sender.transfer(amount);
	        emit WithdrawalEvent(msg.sender, amount);
	        return true;
        }

    function get_owner() public view returns(address){
            return auction_owner;
        }

}