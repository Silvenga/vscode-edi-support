import '../index';

import test from 'ava';
import { expect } from 'chai';

import { EdiDocumentConfiguration, ElementType, Parser } from '../../src/parser';

const config = new EdiDocumentConfiguration('', '*', ':', '>', '~');

test('On ParseSegments, when no matches, return empty array.', t => {

    const input = '';
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, config);

    // Assert
    expect(result).is.empty;
    t.pass();
});

test('On ParseSegments, return matches.', t => {

    const input = 'ISA*hello~BSA*61*2017~';
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, config);

    // Assert
    expect(result).to.have.lengthOf(2);
    t.pass();
});

test('Segment Id should be populated.', t => {

    const input = 'ISA*test~';
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, config);

    // Assert
    expect(result).to.have.lengthOf(1);
    expect(result[0].id).to.be.eq('ISA');
    t.pass();
});

test('Segment end deliminator should be populated.', t => {

    const input = 'ISA*test~';
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, config);

    // Assert
    expect(result[0].endingDelimiter).to.be.eq('~');
    t.pass();
});

test('Segment start index should be populated.', t => {

    const input = 'ISA*test~GA*test~';
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, config);

    // Assert
    expect(result[1].startIndex).to.be.eq(9);
    t.pass();
});

test('Element start index should be populated.', t => {

    const input = 'ISA*test~GA*test~';
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, config);

    // Assert
    expect(result[1].elements[1].startIndex).to.be.eq(11);
    t.pass();
});

test('Can parse empty elements.', t => {

    const input = 'ISA***~';
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, config);

    // Assert
    expect(result[0].elements).to.have.lengthOf(4);
    t.pass();
});

test('Supports extended character sets.', t => {

    const supportCharsExtended = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!\"&'\(\),-./;?= abcdefghijklmnopqrstuvwxyz%@[]_{}\\|<#$:~>";
    const customConfig = new EdiDocumentConfiguration('', '\u0000', '\u0001', '\u0002', '\u0003');
    const input = `ISA\u0000${supportCharsExtended}\u0000test\u0003`;
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, customConfig);

    // Assert
    expect(result[0].elements).to.have.lengthOf(3);
    expect(result[0].elements.findIndex(x => x.type != ElementType.dataElement && x.type != ElementType.segmentId)).is.eq(-1);
    expect(result[0].elements[1].value).is.eq(supportCharsExtended);
    expect(result[0].toString()).is.eq(input);
    t.pass();
});

test('Supports extended character sets when separators are within set.', t => {

    const supportCharsExtended = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!\"&'\(\),-./;?= abcdefghijklmnopqrstuvwxyz%@[]_{}\\|<#$";
    const input = `ISA*${supportCharsExtended}*test~`;
    let parser = new Parser();

    // Act
    let result = parser.parseSegments(input, config);

    // Assert
    expect(result[0].elements).to.have.lengthOf(3);
    expect(result[0].elements.findIndex(x => x.type != ElementType.dataElement && x.type != ElementType.segmentId)).is.eq(-1);
    expect(result[0].toString()).is.eq(input);
    t.pass();
});
