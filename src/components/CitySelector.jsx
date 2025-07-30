import { useState, useEffect } from 'react';
import { Form, Button, InputGroup, OverlayTrigger, Tooltip, Row, Col } from 'react-bootstrap';
import { ArrowLeftRight, GeoAlt, InfoCircle, ChevronDown, ChevronUp } from 'react-bootstrap-icons';
import { citiesData } from '../data/cities';

const CitySelector = ({ from, to, setFrom, setTo, lang = 'ar', onCityClick }) => {
  const cities = citiesData[lang] || citiesData['ar'];
  const [filteredFromCities, setFilteredFromCities] = useState(cities);
  const [filteredToCities, setFilteredToCities] = useState(cities);
  const [isSwapping, setIsSwapping] = useState(false);
  const [expandedFrom, setExpandedFrom] = useState(false);
  const [expandedTo, setExpandedTo] = useState(false);

  // Find selected city objects
  const selectedFromCity = cities.find(c => c.name === from);
  const selectedToCity = cities.find(c => c.name === to);

  // Filter cities to prevent selecting same city in both fields
  useEffect(() => {
    setFilteredToCities(cities.filter(city => city.name !== from));
    setFilteredFromCities(cities.filter(city => city.name !== to));
  }, [from, to, cities]);

  const handleSwap = () => {
    if (!from || !to) return;
    
    setIsSwapping(true);
    const temp = from;
    setFrom(to);
    setTo(temp);
    setTimeout(() => setIsSwapping(false), 300);
  };

  const handleCitySelect = (cityName, type) => {
    if (type === 'from') {
      setFrom(cityName);
      setExpandedFrom(true); // Auto-expand when selecting a city
    } else {
      setTo(cityName);
      setExpandedTo(true);
    }
  };

  const handlePointSelect = (point, type) => {
    if (onCityClick) {
      const fullLocation = `${type === 'from' ? from : to} (${point})`;
      onCityClick(fullLocation);
    }
  };

  const translations = {
    ar: {
      from: "مدينة المغادرة",
      to: "مدينة الوصول",
      selectFrom: "اختر مدينة المغادرة",
      selectTo: "اختر مدينة الوصول",
      tooltip: (name) => `أماكن في ${name}`,
      swap: "تبديل المدن",
      trip: (f, t) => `رحلة من ${f} إلى ${t}`,
      points: "النقاط السياحية"
    },
    en: {
      from: "Departure City",
      to: "Arrival City",
      selectFrom: "Select departure city",
      selectTo: "Select arrival city",
      tooltip: (name) => `Places in ${name}`,
      swap: "Swap cities",
      trip: (f, t) => `Trip from ${f} to ${t}`,
      points: "Tourist Points"
    },
    cn: {
      from: "出发城市",
      to: "到达城市",
      selectFrom: "选择出发城市",
      selectTo: "选择到达城市",
      tooltip: (name) => `${name}的景点`,
      swap: "交换城市",
      trip: (f, t) => `从${f}到${t}的行程`,
      points: "旅游景点"
    }
  };

  const t = translations[lang] || translations['ar'];

  return (
    <div className="mb-4">
      <div className={`d-flex flex-column flex-md-row align-items-center gap-3 ${isSwapping ? 'opacity-75' : ''}`}>
        {/* Departure Selection */}
        <div className="flex-grow-1 w-100">
          <Form.Group controlId="formFromCity">
            <Form.Label className="text-[#749BC2] small">{t.from}</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-[#FFFBDE] border-[#91C8E4]">
                <GeoAlt className="text-[#749BC2]" />
              </InputGroup.Text>
              <Form.Select
                value={from || ''}
                onChange={(e) => handleCitySelect(e.target.value, 'from')}
                size="lg"
                className="shadow-sm border-[#91C8E4] focus:border-[#749BC2]"
              >
                <option value="">{t.selectFrom}</option>
                {filteredFromCities.map((city) => (
                  <option key={`from-${city.name}`} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </Form.Select>
              {from && (
                <Button 
                  variant="outline-secondary"
                  onClick={() => setExpandedFrom(!expandedFrom)}
                  className="bg-[#FFFBDE] border-[#91C8E4]"
                >
                  {expandedFrom ? <ChevronUp /> : <ChevronDown />}
                </Button>
              )}
            </InputGroup>
            
            {/* Points Selection */}
            {expandedFrom && selectedFromCity?.points?.length > 0 && (
              <div className="mt-2 p-3 bg-[#FFFBDE] rounded border border-[#91C8E4]">
                <h6 className="text-[#749BC2] mb-2">{t.points}:</h6>
                <Row className="g-2">
                  {selectedFromCity.points.map((point) => (
                    <Col key={`from-point-${point}`} xs={6} md={4}>
                      <Button
                        variant="outline-primary"
                        onClick={() => handlePointSelect(point, 'from')}
                        className="w-100 text-truncate"
                      >
                        {point}
                      </Button>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Form.Group>
        </div>

        {/* Swap Button */}
        <OverlayTrigger placement="bottom" overlay={<Tooltip>{t.swap}</Tooltip>}>
          <Button
            variant="outline-secondary"
            onClick={handleSwap}
            disabled={!from || !to}
            className="rounded-circle p-2 bg-[#FFFBDE] border-[#91C8E4]"
            style={{ width: '44px', height: '44px' }}
          >
            <ArrowLeftRight className={`transition-all ${isSwapping ? 'rotate-180' : ''} text-[#749BC2]`} />
          </Button>
        </OverlayTrigger>

        {/* Destination Selection */}
        <div className="flex-grow-1 w-100">
          <Form.Group controlId="formToCity">
            <Form.Label className="text-[#749BC2] small">{t.to}</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-[#FFFBDE] border-[#91C8E4]">
                <GeoAlt className="text-[#749BC2]" />
              </InputGroup.Text>
              <Form.Select
                value={to || ''}
                onChange={(e) => handleCitySelect(e.target.value, 'to')}
                size="lg"
                className="shadow-sm border-[#91C8E4] focus:border-[#749BC2]"
              >
                <option value="">{t.selectTo}</option>
                {filteredToCities.map((city) => (
                  <option key={`to-${city.name}`} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </Form.Select>
              {to && (
                <Button 
                  variant="outline-secondary"
                  onClick={() => setExpandedTo(!expandedTo)}
                  className="bg-[#FFFBDE] border-[#91C8E4]"
                >
                  {expandedTo ? <ChevronUp /> : <ChevronDown />}
                </Button>
              )}
            </InputGroup>
            
            {/* Points Selection */}
            {expandedTo && selectedToCity?.points?.length > 0 && (
              <div className="mt-2 p-3 bg-[#FFFBDE] rounded border border-[#91C8E4]">
                <h6 className="text-[#749BC2] mb-2">{t.points}:</h6>
                <Row className="g-2">
                  {selectedToCity.points.map((point) => (
                    <Col key={`to-point-${point}`} xs={6} md={4}>
                      <Button
                        variant="outline-primary"
                        onClick={() => handlePointSelect(point, 'to')}
                        className="w-100 text-truncate"
                      >
                        {point}
                      </Button>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Form.Group>
        </div>
      </div>

      {from && to && (
        <div className="text-center mt-3">
          <p className="text-[#749BC2] mb-0">
            {t.trip(from, to)}
          </p>
        </div>
      )}
    </div>
  );
};

export default CitySelector;